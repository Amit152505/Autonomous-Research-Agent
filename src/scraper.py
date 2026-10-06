"""
Web Page Extractor module for downloading, cleaning, and extracting article text.
"""

from __future__ import annotations
import re
import urllib.request
from typing import Any
from .utils import clean_text, truncate_text


def scrape_url(url: str, timeout: int = 7, max_chars: int = 3500) -> dict[str, Any]:
    """
    Safely fetches a webpage and extracts clean readable text.
    
    Removes boilerplate elements (navigation, headers, footers, advertisements, scripts)
    and bounds the content size to prevent token explosion.
    
    Returns structured output:
    {
        "url": str,
        "title": str,
        "content": str,
        "status": "success" | "error",
        "error": str | None
    }
    """
    if not url or not url.startswith("http"):
        return {
            "url": url,
            "title": "",
            "content": "",
            "status": "error",
            "error": "Invalid or missing URL scheme",
        }

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    raw_html = ""
    # Try requests library first
    try:
        import requests  # type: ignore
        resp = requests.get(url, headers=headers, timeout=timeout)
        if resp.status_code == 200:
            raw_html = resp.text
        else:
            return {
                "url": url,
                "title": "",
                "content": "",
                "status": "error",
                "error": f"HTTP status {resp.status_code}",
            }
    except Exception:
        # Fallback to urllib.request
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as response:
                raw_html = response.read().decode("utf-8", errors="ignore")
        except Exception as e:
            return {
                "url": url,
                "title": "",
                "content": "",
                "status": "error",
                "error": f"Connection failed: {str(e)}",
            }

    if not raw_html:
        return {
            "url": url,
            "title": "",
            "content": "",
            "status": "error",
            "error": "Empty response body",
        }

    extracted_title = ""
    extracted_text = ""

    # Parse with BeautifulSoup if available
    try:
        from bs4 import BeautifulSoup  # type: ignore
        soup = BeautifulSoup(raw_html, "html.parser")

        # Extract title
        if soup.title and soup.title.string:
            extracted_title = soup.title.string.strip()

        # Remove boilerplates
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg", "form", "button"]):
            tag.decompose()

        # Prioritize main content containers if present
        main_container = soup.find(["main", "article"]) or soup.find(id=re.compile(r"content|body|article", re.I))
        target_node = main_container if main_container else soup.body or soup

        # Extract paragraphs and headers
        blocks = []
        for element in target_node.find_all(["p", "h1", "h2", "h3", "li"]):
            text = element.get_text(separator=" ", strip=True)
            if len(text) > 20:  # Skip tiny fragments
                blocks.append(text)

        extracted_text = "\n\n".join(blocks)
    except Exception:
        # Fallback regex-based HTML stripper
        title_match = re.search(r"<title>(.*?)</title>", raw_html, re.IGNORECASE | re.DOTALL)
        if title_match:
            extracted_title = re.sub(r"<[^>]+>", "", title_match.group(1)).strip()

        cleaned = re.sub(r"<(script|style|nav|footer|header|aside)[^>]*>.*?</\1>", " ", raw_html, flags=re.DOTALL | re.IGNORECASE)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        extracted_text = cleaned

    cleaned_text = clean_text(extracted_text)
    bounded_text = truncate_text(cleaned_text, max_length=max_chars)

    if len(bounded_text) < 60:
        return {
            "url": url,
            "title": extracted_title,
            "content": "",
            "status": "error",
            "error": "Insufficient text content extracted from page",
        }

    return {
        "url": url,
        "title": extracted_title or "Web Document",
        "content": bounded_text,
        "status": "success",
        "error": None,
    }
