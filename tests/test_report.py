"""
Tests for CitationManager and ReportGenerator.
Compatible with both pytest and python -m unittest.
"""

import unittest
from src.citation_manager import CitationManager
from src.report_generator import ReportGenerator


class TestReportAndCitations(unittest.TestCase):

    def setUp(self):
        self.cm = CitationManager()

    def test_citation_registration_and_numbering(self):
        """Verify sequential 1-based indexing for registered sources."""
        id1 = self.cm.register_source("Doc A", "https://example.com/a", "Snippet A")
        id2 = self.cm.register_source("Doc B", "https://example.com/b", "Snippet B")
        # Duplicate registration should return existing ID
        id1_again = self.cm.register_source("Doc A Alt", "https://example.com/a/", "Snippet A2")

        self.assertEqual(id1, 1)
        self.assertEqual(id2, 2)
        self.assertEqual(id1_again, 1)
        self.assertEqual(len(self.cm.get_all_sources()), 2)

    def test_citation_formatting(self):
        """Verify standard formatted markdown sources section."""
        self.cm.register_source("Python Official", "https://python.org", "Docs")
        sources_text = self.cm.format_sources_section()
        self.assertIn("## Sources", sources_text)
        self.assertIn("[1] [Python Official](https://python.org)", sources_text)

    def test_citation_validation(self):
        """Verify validator flags hallucinated source IDs and validates correct ones."""
        self.cm.register_source("Doc A", "https://example.com/a")
        self.cm.register_source("Doc B", "https://example.com/b")

        valid_text = "According to research [1], performance scales well [2]."
        invalid_text = "According to research [1], future methods [99] promise more."

        val_good = self.cm.validate_citations(valid_text)
        self.assertTrue(val_good["is_valid"])
        self.assertEqual(val_good["referenced_ids"], [1, 2])

        val_bad = self.cm.validate_citations(invalid_text)
        self.assertFalse(val_bad["is_valid"])
        self.assertIn(99, val_bad["hallucinated_ids"])

    def test_report_generator_structure(self):
        """Ensure generated report contains all required markdown headings."""
        rg = ReportGenerator(self.cm)
        self.cm.register_source("RAG Paper", "https://arxiv.org/abs/2005.11401")
        
        sample_synthesis = {
            "findings": ["RAG reduces hallucination risk [1]."],
            "consensus": ["RAG combines retrieval with generative models [1]."],
            "contradictions": ["Fine-tuning alters base parameters while RAG updates knowledge dynamically."],
            "advantages": ["Dynamic knowledge updates without retraining."],
            "limitations": ["Higher retrieval latency."],
        }
        sources = self.cm.get_all_sources()

        report = rg.generate_report(
            "What are the advantages of RAG?",
            sample_synthesis,
            sources,
        )

        required_headings = [
            "# Research Report",
            "## Research Question",
            "## Executive Summary",
            "## Introduction",
            "## Key Findings",
            "## Detailed Analysis",
            "## Different Perspectives",
            "## Advantages",
            "## Limitations",
            "## Conclusion",
            "## Sources",
        ]

        for heading in required_headings:
            self.assertIn(heading, report, f"Missing required heading: {heading}")


if __name__ == "__main__":
    unittest.main()
