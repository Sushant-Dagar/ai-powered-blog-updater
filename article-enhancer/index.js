import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

async function fetchArticles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/articles?enhanced=false`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    return [];
  }
}

async function searchGoogle(query) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('div.g').each((index, element) => {
      const linkElement = $(element).find('a').first();
      const href = linkElement.attr('href');
      const title = $(element).find('h3').text();

      if (href && title && !href.includes('google.com') && !href.includes('youtube.com')) {
        const url = href.startsWith('/url?q=') ? href.split('/url?q=')[1].split('&')[0] : href;
        if (url.startsWith('http')) {
          results.push({ url: decodeURIComponent(url), title });
        }
      }
    });

    const blogResults = results.filter(r =>
      !r.url.includes('beyondchats.com') &&
      (r.url.includes('blog') ||
       r.url.includes('article') ||
       r.url.includes('/post') ||
       r.title.toLowerCase().includes('guide') ||
       r.title.toLowerCase().includes('how to') ||
       results.indexOf(r) < 5)
    ).slice(0, 2);

    return blogResults.length >= 2 ? blogResults : results.filter(r => !r.url.includes('beyondchats.com')).slice(0, 2);
  } catch (error) {
    console.error('Error searching Google:', error.message);
    return [];
  }
}

async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    $('script, style, nav, footer, header, aside, .sidebar, .advertisement, .ad, .comments').remove();

    const selectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      'main',
      '.blog-post',
      '.post-body'
    ];

    let content = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 200) {
        content = element.text().trim();
        break;
      }
    }

    if (!content) {
      content = $('body').text().trim();
    }

    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()
      .substring(0, 8000);

    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return '';
  }
}

async function enhanceArticleWithLLM(originalArticle, referenceArticles) {
  const referenceTexts = referenceArticles
    .map((ref, i) => `Reference Article ${i + 1} (${ref.title}):\n${ref.content}`)
    .join('\n\n---\n\n');

  const prompt = `You are a professional content writer. Your task is to enhance and improve an existing article based on reference articles that are ranking well on Google.

ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

REFERENCE ARTICLES FROM GOOGLE SEARCH:
${referenceTexts}

INSTRUCTIONS:
1. Analyze the formatting, structure, and writing style of the reference articles
2. Improve the original article's content, making it more comprehensive and engaging
3. Adopt similar formatting patterns (headers, lists, paragraphs) from the top-ranking articles
4. Add relevant information that might be missing from the original
5. Maintain the original article's core message and topic
6. Make the content more SEO-friendly
7. Use proper HTML formatting (h2, h3, p, ul, li, strong tags)
8. Keep the tone professional and informative

OUTPUT FORMAT:
Provide ONLY the enhanced article content in HTML format (no title, just the body content with proper HTML tags). Do not include any explanations or meta-commentary.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional content writer specializing in SEO-optimized articles.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    return null;
  }
}

async function updateArticle(articleId, enhancedContent, references) {
  try {
    const response = await axios.put(`${API_BASE_URL}/articles/${articleId}/enhance`, {
      enhanced_content: enhancedContent,
      reference_1_url: references[0]?.url || null,
      reference_1_title: references[0]?.title || null,
      reference_2_url: references[1]?.url || null,
      reference_2_title: references[1]?.title || null
    });
    return response.data;
  } catch (error) {
    console.error('Error updating article:', error.message);
    return null;
  }
}

async function processArticle(article) {
  console.log(`\nProcessing: "${article.title}"`);

  console.log('  Searching Google for related articles...');
  const searchResults = await searchGoogle(article.title);

  if (searchResults.length < 2) {
    console.log('  Could not find enough reference articles. Skipping.');
    return false;
  }

  console.log(`  Found ${searchResults.length} reference articles:`);
  searchResults.forEach((r, i) => console.log(`    ${i + 1}. ${r.title}`));

  console.log('  Scraping reference articles...');
  const referenceArticles = [];
  for (const result of searchResults) {
    const content = await scrapeArticleContent(result.url);
    if (content) {
      referenceArticles.push({
        url: result.url,
        title: result.title,
        content: content
      });
    }
  }

  if (referenceArticles.length < 1) {
    console.log('  Could not scrape reference articles. Skipping.');
    return false;
  }

  console.log('  Enhancing article with LLM...');
  const enhancedContent = await enhanceArticleWithLLM(article, referenceArticles);

  if (!enhancedContent) {
    console.log('  LLM enhancement failed. Skipping.');
    return false;
  }

  console.log('  Publishing enhanced article...');
  const result = await updateArticle(article.id, enhancedContent, referenceArticles);

  if (result) {
    console.log('  Article enhanced successfully!');
    return true;
  }

  return false;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Article Enhancement Script');
  console.log('='.repeat(60));

  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in environment variables.');
    console.log('Please create a .env file with your OpenAI API key.');
    process.exit(1);
  }

  console.log('\nFetching articles from API...');
  const articles = await fetchArticles();

  if (articles.length === 0) {
    console.log('No articles to process.');
    return;
  }

  console.log(`Found ${articles.length} articles to enhance.`);

  let successCount = 0;
  for (const article of articles) {
    const success = await processArticle(article);
    if (success) successCount++;

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Enhancement complete: ${successCount}/${articles.length} articles processed.`);
  console.log('='.repeat(60));
}

main().catch(console.error);
