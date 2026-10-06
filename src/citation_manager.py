"""
Citation Management System for evidence attribution and source mapping.
"""

from __future__ import annotations
import re
from typing import Any
from .utils import extract_domain


class CitationManager:
    """
    Tracks and maps numerical citations ([1], [2]) to verified web sources.
    
    Guarantees:
    - Unique ID mapping for each validated URL.
    - Deterministic formatted sources list.
    - Verification that report citations only reference valid, extracted sources.
    """

    def __init__(self) -> None:
        self.sources: list[dict[str, Any]] = []
        self._url_to_id: dict[str, int] = {}

    def register_source(self, title: str, url: str, snippet: str = "", relevance_score: float = 0.8) -> int:
        """
        Registers a source and returns its assigned 1-based citation ID.
        If the URL is already registered, returns the existing ID.
        """
        url = url.strip()
        normalized_url = url.rstrip("/").lower()

        if normalized_url in self._url_to_id:
            return self._url_to_id[normalized_url]

        citation_id = len(self.sources) + 1
        source_entry = {
            "id": citation_id,
            "title": title.strip() or f"Source {citation_id}",
            "url": url,
            "domain": extract_domain(url),
            "snippet": snippet.strip(),
            "relevance_score": relevance_score,
        }
        self.sources.append(source_entry)
        self._url_to_id[normalized_url] = citation_id
        return citation_id

    def get_source(self, citation_id: int) -> dict[str, Any] | None:
        """Retrieves source metadata by citation ID (1-based index)."""
        if 1 <= citation_id <= len(self.sources):
            return self.sources[citation_id - 1]
        return None

    def get_all_sources(self) -> list[dict[str, Any]]:
        """Returns all registered sources in citation order."""
        return list(self.sources)

    def format_sources_section(self) -> str:
        """
        Formats all registered sources into standard Markdown reference list:
        [1] Source Title — URL
        """
        if not self.sources:
            return "No external sources were referenced."

        lines = ["## Sources\n"]
        for s in self.sources:
            lines.append(f"[{s['id']}] [{s['title']}]({s['url']}) — {s['domain']}")
        return "\n".join(lines)

    def validate_citations(self, text: str) -> dict[str, Any]:
        """
        Scans a text for citation brackets like [1], [2], [1, 2] and checks
        if any reference non-existent source IDs.
        """
        citation_matches = re.findall(r"\[(\d+)\]", text)
        referenced_ids = {int(match) for match in citation_matches}
        valid_ids = {s["id"] for s in self.sources}

        hallucinated_ids = referenced_ids - valid_ids
        unreferenced_ids = valid_ids - referenced_ids

        return {
            "is_valid": len(hallucinated_ids) == 0,
            "referenced_ids": sorted(list(referenced_ids)),
            "hallucinated_ids": sorted(list(hallucinated_ids)),
            "unreferenced_ids": sorted(list(unreferenced_ids)),
            "total_sources": len(self.sources),
        }
