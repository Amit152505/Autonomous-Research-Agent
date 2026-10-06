"""
Web Search module with multi-provider fallbacks and structured output.
"""

from __future__ import annotations
import json
import os
import re
import urllib.parse
import urllib.request
from typing import Any
from .utils import deduplicate_urls


def _search_duckduckgo_api(query: str, max_results: int = 5) -> list[dict[str, str]]:
    """
    Attempts search via duckduckgo_search library if installed.
    """
    try:
        from duckduckgo_search import DDGS  # type: ignore
        results = []
        with DDGS() as ddgs:
            for item in ddgs.text(query, max_results=max_results):
                title = item.get("title", "").strip()
                url = item.get("href", "").strip()
                snippet = item.get("body", "").strip()
                if url and title:
                    results.append({"title": title, "url": url, "snippet": snippet})
        return results
    except Exception:
        return []


def _search_ddg_html_fallback(query: str, max_results: int = 5) -> list[dict[str, str]]:
    """
    Lightweight fallback using DuckDuckGo HTML endpoint without external dependencies.
    """
    try:
        url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query})
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        with urllib.request.urlopen(req, timeout=7) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        # Parse links and snippets using regex to avoid extra dependencies if bs4 is missing
        results: list[dict[str, str]] = []
        # Pattern for DuckDuckGo HTML results
        matches = re.findall(
            r'<a class="result__url"[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?<a class="result__snippet"[^>]*>(.*?)</a>',
            html,
            re.DOTALL,
        )

        for raw_url, raw_title, raw_snippet in matches[:max_results]:
            clean_url = urllib.parse.unquote(raw_url.strip())
            # Clean DuckDuckGo redirect wrapper if present
            if "uddg=" in clean_url:
                param = urllib.parse.parse_qs(urllib.parse.urlparse(clean_url).query)
                clean_url = param.get("uddg", [clean_url])[0]
            clean_title = re.sub(r"<[^>]+>", "", raw_title).strip()
            clean_snippet = re.sub(r"<[^>]+>", "", raw_snippet).strip()
            if clean_url.startswith("http") and clean_title:
                results.append({"title": clean_title, "url": clean_url, "snippet": clean_snippet})

        return results
    except Exception:
        return []


def _search_wikipedia_fallback(query: str, max_results: int = 3) -> list[dict[str, str]]:
    """
    Queries Wikipedia OpenSearch API for relevant reference material.
    Extremely reliable, high-reputation fallback for conceptual definitions.
    """
    try:
        api_url = (
            "https://en.wikipedia.org/w/api.php?"
            + urllib.parse.urlencode({
                "action": "opensearch",
                "search": query,
                "limit": str(max_results),
                "namespace": "0",
                "format": "json",
            })
        )
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": "AutonomousResearchAgent/1.0"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        results = []
        if isinstance(data, list) and len(data) >= 4:
            titles = data[1]
            snippets = data[2]
            urls = data[3]
            for t, s, u in zip(titles, snippets, urls):
                if u and t:
                    results.append({"title": t, "url": u, "snippet": s or f"Overview and research background for {t}"})
        return results
    except Exception:
        return []


def search_web(query: str, max_results: int = 5) -> list[dict[str, str]]:
    """
    Searches the web for relevant sources using available search providers.
    
    Guarantees:
    - Never throws an uncaught exception.
    - Removes duplicate URLs.
    - Returns structured list of dictionaries with 'title', 'url', and 'snippet'.
    """
    clean_query = query.strip()
    if not clean_query:
        return []

    results: list[dict[str, str]] = []

    # Provider 1: duckduckgo_search library
    results = _search_duckduckgo_api(clean_query, max_results=max_results)

    # Provider 2: DDG HTML direct fallback
    if len(results) < 2:
        fallback_results = _search_ddg_html_fallback(clean_query, max_results=max_results)
        results.extend(fallback_results)

    # Provider 3: Wikipedia Reference API fallback
    if len(results) < 2:
        wiki_results = _search_wikipedia_fallback(clean_query, max_results=3)
        results.extend(wiki_results)

    # Clean and deduplicate
    deduped = deduplicate_urls(results)
    return deduped[:max_results]
