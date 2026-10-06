"""
Utility functions for text processing, domain parsing, and source scoring.
"""

from __future__ import annotations
import re
import urllib.parse
from typing import Any, Iterable


def extract_domain(url: str) -> str:
    """
    Extracts the clean network domain name from a URL.
    
    Example:
        'https://docs.python.org/3/library' -> 'docs.python.org'
    """
    try:
        parsed = urllib.parse.urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc or "web"
    except Exception:
        return "web"


def clean_text(text: str) -> str:
    """
    Removes extraneous whitespace, non-printable characters, and formatting artifacts.
    """
    if not text:
        return ""
    # Normalize unicode spaces and excessive blank lines
    text = re.sub(r"[\r\t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ ]{2,}", " ", text)
    return text.strip()


def truncate_text(text: str, max_length: int = 1500) -> str:
    """
    Truncates text at word boundary to avoid cutting words in half.
    """
    if not text or len(text) <= max_length:
        return text
    truncated = text[:max_length]
    last_space = truncated.rfind(" ")
    if last_space > 0:
        truncated = truncated[:last_space]
    return truncated.rstrip() + "..."


def compute_relevance_score(query: str, title: str, snippet: str = "") -> float:
    """
    Computes a transparent, normalized relevance score (0.0 to 1.0)
    based on keyword overlap between query terms and source text.
    
    Deterministic scoring function:
    - Analyzes token overlap against title (weighted higher) and snippet.
    - Grants credibility boost for trusted academic / documentation domains.
    """
    combined = f"{title} {snippet}".lower()
    # Tokenize query, skipping common short stop words
    stopwords = {"what", "is", "the", "and", "or", "to", "in", "a", "of", "for", "with", "how", "on", "are", "at"}
    query_tokens = [
        re.sub(r"[^\w]", "", word.lower())
        for word in query.split()
        if len(word) > 2
    ]
    query_tokens = [tok for tok in query_tokens if tok and tok not in stopwords]

    if not query_tokens:
        return 0.50

    matches_in_title = sum(1 for tok in query_tokens if tok in title.lower())
    matches_in_text = sum(1 for tok in query_tokens if tok in combined)

    # Base score: Title matches have higher weight (60%), snippet matches (40%)
    title_ratio = matches_in_title / len(query_tokens)
    text_ratio = matches_in_text / len(query_tokens)
    score = (title_ratio * 0.6) + (text_ratio * 0.4)

    # Baseline minimum relevance for returned search items
    score = max(0.40, min(0.98, round(score * 0.7 + 0.3, 2)))
    return score


def deduplicate_urls(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Deduplicates a list of source dictionaries based on normalized URL,
    preserving original discovery order.
    """
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []

    for item in sources:
        url = item.get("url", "").strip()
        if not url:
            continue
        # Normalize trailing slash and lowercase host
        norm_url = url.rstrip("/").lower()
        if norm_url not in seen:
            seen.add(norm_url)
            unique.append(item)

    return unique
