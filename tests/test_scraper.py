"""
Tests for HTML Scraper and content extraction.
Compatible with both pytest and python -m unittest.
"""

import unittest
from src.scraper import scrape_url
from src.utils import clean_text, truncate_text


class TestScraper(unittest.TestCase):

    def test_invalid_url_handling(self):
        """Scraper should handle invalid URLs gracefully without crashing."""
        res = scrape_url("not-a-valid-url")
        self.assertEqual(res["status"], "error")
        self.assertIsNotNone(res["error"])

    def test_clean_text_utility(self):
        """clean_text should strip excessive whitespace and redundant newlines."""
        raw = "Hello   world!\n\n\n\nThis is    a   test.\t\t"
        cleaned = clean_text(raw)
        self.assertEqual(cleaned, "Hello world!\n\nThis is a test.")

    def test_truncate_text(self):
        """truncate_text should respect max character limit and word boundaries."""
        sample = "The quick brown fox jumps over the lazy dog."
        truncated = truncate_text(sample, max_length=20)
        self.assertTrue(len(truncated) <= 23)  # with ellipsis
        self.assertTrue(truncated.endswith("..."))

    def test_empty_string_truncation(self):
        """Truncate on empty string returns empty string."""
        self.assertEqual(truncate_text(""), "")


if __name__ == "__main__":
    unittest.main()
