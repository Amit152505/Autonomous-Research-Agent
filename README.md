# Autonomous Research Agent 🔬

A production-grade Autonomous Research Agent built in Python. Given any research question, the agent autonomously plans search queries, discovers live web sources, filters and extracts clean text, cross-synthesizes evidence across documents, and produces an executive research report with verified numerical citations.

---

## Architecture Overview

```text
User Input Question
       ↓
[ Research Planner ]  ───> Decomposes topic into 2–6 targeted query angles
       ↓
[ Multi-Engine Search ] ───> Discovers candidates & deduplicates URLs
       ↓
[ Source Filter & Scorer ] ── Calculates relevance scores & domain reputation
       ↓
[ HTML Web Scraper ]  ───> Strips boilerplate, navigates failures gracefully
       ↓
[ Iteration Evaluator ] ─> Assesses evidence sufficiency (up to 2 iterations)
       ↓
[ Cross-Source Synthesizer ] -> Extracts consensus, contradictions & advantages
       ↓
[ Citation Manager ]  ───> Enforces [1], [2] attribution mapping
       ↓
[ Report Generator ]  ───> Produces structured Markdown report with Sources
       ↓
Streamlit Dashboard / Downloadable Markdown Report
```

---

## Key Features

- **Autonomous Query Generation**: Decomposes complex questions into orthogonal search angles.
- **Resilient Web Search**: Multi-provider search system (DuckDuckGo, Wikipedia API, Gemini Search Grounding) with automatic deduplication.
- **Content Extraction & Cleaning**: BeautifulSoup4 scraper that strips navigation, scripts, ads, and footers while bounding token sizes.
- **Source Filtering & Relevance Scoring**: Real-time keyword & domain heuristic relevance scores (0.00 to 1.00).
- **Cross-Source Evidence Synthesis**: Rather than summarizing pages in isolation, reasons across sources to detect consensus, tensions, and trade-offs.
- **Strict Citation Manager**: Enforces 1-based numbered citations (`[1]`, `[2]`) linked to verified URLs without hallucinated sources.
- **Configurable Research Depth**:
  - **Quick**: 2 queries, 3–5 sources, 1 iteration (fastest)
  - **Standard**: 4 queries, 5–8 sources, 1–2 iterations (balanced)
  - **Deep**: 6 queries, 8–12 sources, up to 2 iterations (in-depth)
- **Interactive Streamlit Interface**: Real-time progress checkmarks, metrics overview, data tables, and one-click `.md` export.
- **Zero-Dependency Fallbacks**: Safe deterministic heuristics enable offline testing without requiring an active API key.

---

## Project Structure

```text
autonomous-research-agent/
│
├── app.py                      # Main Streamlit dashboard application
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore definitions
│
├── src/                        # Core agent package
│   ├── __init__.py             # Package exports
│   ├── researcher.py           # Autonomous research loop orchestrator
│   ├── search.py               # Web search module with multi-tier fallback
│   ├── scraper.py              # HTML scraping and text cleaning
│   ├── analyzer.py             # Cross-source evidence synthesis
│   ├── report_generator.py     # Markdown report generation
│   ├── citation_manager.py     # Numerical citation registry & validation
│   └── utils.py                # Text normalization and relevance scoring
│
├── tests/                      # Automated unit test suite
│   ├── test_search.py          # Search result format & deduplication tests
│   ├── test_scraper.py         # HTML cleaning & error handling tests
│   └── test_report.py          # Citation mapping & report structure tests
│
└── examples/
    └── example_research.md     # RAG vs. Fine-Tuning sample research report
```

---

## Quickstart & Installation

### 1. Prerequisites
- Python 3.10 or higher
- Git

### 2. Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/your-username/autonomous-research-agent.git
cd autonomous-research-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your API key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(Note: If no API key is provided, the agent will operate in deterministic heuristic mode, allowing you to test the full pipeline offline.)*

### 4. Run the Streamlit Dashboard
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## Running the Automated Tests

Run the test suite with either standard `unittest` or `pytest`:

```bash
# Using Python's built-in test runner:
python -m unittest discover tests

# Or using pytest:
pytest tests/ -v
```

All 12 unit tests verify URL deduplication, relevance scoring, HTML boilerplate removal, citation integrity, and report formatting.

---

## Example Research Queries

Try running the agent with these example questions:
- *"What are the advantages and limitations of Retrieval-Augmented Generation compared with fine-tuning?"*
- *"How is AI changing software development?"*
- *"What are the current approaches to detecting deepfakes?"*
- *"How does vector search work?"*
- *"What are the advantages of edge AI?"*

---

## Practical Limitations

- **Search Quality**: Automated search results depend on public search indexes and connectivity.
- **Paywalls & Bot Protection**: Certain commercial sites block automated requests or require JavaScript execution.
- **LLM Synthesis**: Synthesis models may summarize with stylistic variance; citations should be verified against source links before formal publication.
- **Not an Academic Peer Review**: Designed for fast, structured technical triage and landscape overviews, not formal academic peer-review verification.

---

## Future Improvements (V2 Roadmap)

- [ ] **PDF & Document Research**: Ingest local whitepapers, ArXiv PDFs, and enterprise documentation.
- [ ] **Academic Paper APIs**: Direct integration with Semantic Scholar, ArXiv API, and PubMed.
- [ ] **Vector Database Memory**: Chunking and local embeddings using ChromaDB or FAISS for multi-hop semantic retrieval.
- [ ] **Source Credibility Index**: Domain reputation ranking based on PageRank, journal indexing, and TLS certificates.
- [ ] **Automatic Contradiction Detection**: Dedicated matrix comparing conflicting statistical claims.
- [ ] **Persistent Research Sessions**: Session history export to SQLite / PostgreSQL.
- [ ] **Multi-Agent Specialist Teams**: Planner, Fact-Checker, and Critic agents interacting in a review loop.
- [ ] **FastAPI Backend & Dockerization**: RESTful API endpoints and lightweight containerized deployments.
- [ ] **Export to LaTeX & PDF**: One-click generation of academic preprints and slide decks.

---

## License

MIT License. Free for open source and commercial use.
