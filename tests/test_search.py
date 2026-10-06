"""
Tests for Web Search module and URL deduplication.
Compatible with both pytest and python -m unittest.
"""

import unittest
from src.search import search_web
from src.utils import deduplicate_urls, compute_relevance_score


class TestSearch(unittest.TestCase):

    def test_search_structure_and_types(self):
        """Verify search returns a list of dictionaries with required keys."""
        results = search_web("Retrieval-Augmented Generation", max_results=3)
        self.assertIsInstance(results, list)
        for item in results:
            self.assertIn("title", item)
            self.assertIn("url", item)
            self.assertIn("snippet", item)
            self.assertTrue(item["url"].startswith("http"))

    def test_empty_query_returns_empty(self):
        """Ensure empty query returns empty list without errors."""
        results = search_web("")
        self.assertEqual(results, [])

    def test_deduplicate_urls(self):
        """Ensure duplicate URLs are removed while preserving order."""
        sample_sources = [
            {"title": "Doc 1", "url": "https://example.com/rag"},
            {"title": "Doc 2", "url": "https://example.com/finetune"},
            {"title": "Doc 1 Duplicate", "url": "https://example.com/rag/"},
            {"title": "Doc 3", "url": "https://example.com/llm"},
        ]
        deduped = deduplicate_urls(sample_sources)
        self.assertEqual(len(deduped), 3)
        self.assertEqual(deduped[0]["url"], "https://example.com/rag")
        self.assertEqual(deduped[1]["url"], "https://example.com/finetune")
        self.assertEqual(deduped[2]["url"], "https://example.com/llm")

    def test_relevance_scoring(self):
        """Ensure relevance score is bounded between 0.0 and 1.0 and sensitive to keywords."""
        query = "Retrieval Augmented Generation RAG advantages"
        high_score = compute_relevance_score(
            query,
            title="Understanding Retrieval-Augmented Generation (RAG) Advantages",
            snippet="Detailed overview of RAG benefits over fine-tuning.",
        )
        low_score = compute_relevance_score(
            query,
            title="Introduction to French Cuisine",
            snippet="Cooking recipes and baking techniques.",
        )
        self.assertGreater(high_score, low_score)
        self.assertTrue(0.0 <= high_score <= 1.0)
        self.assertTrue(0.0 <= low_score <= 1.0)


if __name__ == "__main__":
    unittest.main()
