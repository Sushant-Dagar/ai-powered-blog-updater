<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::query();

        if ($request->has('enhanced')) {
            $query->where('is_enhanced', $request->boolean('enhanced'));
        }

        $articles = $query->orderBy('published_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $articles
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'author' => 'nullable|string|max:255',
            'source_url' => 'nullable|url',
            'published_date' => 'nullable|date',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string',
            'enhanced_content' => 'nullable|string',
            'reference_1_url' => 'nullable|url',
            'reference_1_title' => 'nullable|string|max:255',
            'reference_2_url' => 'nullable|url',
            'reference_2_title' => 'nullable|string|max:255',
            'is_enhanced' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        $originalSlug = $validated['slug'];
        $count = 1;
        while (Article::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        if (!empty($validated['is_enhanced']) && $validated['is_enhanced']) {
            $validated['enhanced_at'] = now();
        }

        $article = Article::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Article created successfully',
            'data' => $article
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $article
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'author' => 'nullable|string|max:255',
            'source_url' => 'nullable|url',
            'published_date' => 'nullable|date',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string',
            'enhanced_content' => 'nullable|string',
            'reference_1_url' => 'nullable|url',
            'reference_1_title' => 'nullable|string|max:255',
            'reference_2_url' => 'nullable|url',
            'reference_2_title' => 'nullable|string|max:255',
            'is_enhanced' => 'nullable|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $article->title) {
            $validated['slug'] = Str::slug($validated['title']);
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Article::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count++;
            }
        }

        if (!empty($validated['is_enhanced']) && $validated['is_enhanced'] && !$article->is_enhanced) {
            $validated['enhanced_at'] = now();
        }

        $article->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Article updated successfully',
            'data' => $article->fresh()
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully'
        ]);
    }

    public function enhance(Request $request, string $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => 'Article not found'
            ], 404);
        }

        $validated = $request->validate([
            'enhanced_content' => 'required|string',
            'reference_1_url' => 'nullable|url',
            'reference_1_title' => 'nullable|string|max:255',
            'reference_2_url' => 'nullable|url',
            'reference_2_title' => 'nullable|string|max:255',
        ]);

        $article->update([
            'enhanced_content' => $validated['enhanced_content'],
            'reference_1_url' => $validated['reference_1_url'] ?? null,
            'reference_1_title' => $validated['reference_1_title'] ?? null,
            'reference_2_url' => $validated['reference_2_url'] ?? null,
            'reference_2_title' => $validated['reference_2_title'] ?? null,
            'is_enhanced' => true,
            'enhanced_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Article enhanced successfully',
            'data' => $article->fresh()
        ]);
    }
}
