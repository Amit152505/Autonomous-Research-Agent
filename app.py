"""
Autonomous Research Agent - Streamlit Application
An autonomous research application for web investigation and report generation.
"""

from __future__ import annotations
import os
import sys
import time

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import streamlit as st
import pandas as pd

# Add local directory to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.researcher import AutonomousResearchAgent


# Page configuration
st.set_page_config(
    page_title="Autonomous Research Agent",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    .finding-box {
        background-color: #F0FDF4;
        border-left: 4px solid #16A34A;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        border-radius: 4px;
    }
    .limitation-box {
        background-color: #FEF2F2;
        border-left: 4px solid #DC2626;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)


def main():
    # Header Section
    st.markdown('<div class="main-header">🔬 Autonomous Research Agent</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Research smarter. Discover sources. Generate evidence-based reports with real citations.</div>',
        unsafe_allow_html=True,
    )

    # Sidebar configuration
    with st.sidebar:
        st.subheader("⚙️ Agent Settings")
        
        # Depth selector
        depth = st.radio(
            "Research Depth",
            options=["Quick", "Standard", "Deep"],
            index=1,
            help=(
                "Quick: 2 queries, 3-5 sources (fastest)\n"
                "Standard: 4 queries, 5-8 sources (balanced)\n"
                "Deep: 6 queries, 8-12 sources (in-depth analysis)"
            ),
        )

        st.markdown("---")
        st.markdown("### 🤖 Model & Provider")
        api_key_present = bool(os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY"))
        if api_key_present:
            st.success("✓ Language model API configured")
        else:
            st.info("ℹ️ Running in Heuristic Mode (Configure GEMINI_API_KEY in .env to enable language model synthesis)")

        st.markdown("---")
        st.markdown("### 📚 Architecture Flow")
        st.markdown("""
        1. **Query Planning** 🧠
        2. **Web Search** 🌐
        3. **Source Scoring** 📊
        4. **HTML Extraction** 📄
        5. **Cross-Synthesis** 🧩
        6. **Report Generation** 📝
        """)

    # Example question chips
    st.write("##### Quick Example Questions:")
    examples = [
        "What are the advantages and limitations of Retrieval-Augmented Generation compared with fine-tuning?",
        "How is AI changing software development?",
        "What are the current approaches to detecting deepfakes?",
        "How does vector search work?",
        "What are the advantages of edge AI?",
    ]
    
    col_ex = st.columns(len(examples))
    selected_example = None
    for idx, (col, ex) in enumerate(zip(col_ex, examples)):
        short_label = ex.split()[0:4]
        if col.button(f"💡 {' '.join(short_label)}...", key=f"ex_{idx}"):
            selected_example = ex

    # Main text input
    default_text = selected_example or "What are the advantages and limitations of Retrieval-Augmented Generation compared with fine-tuning?"
    query = st.text_area(
        "What would you like to research?",
        value=default_text,
        height=100,
        placeholder="Enter your research question or topic...",
    )

    start_button = st.button("🚀 Start Autonomous Research", type="primary", use_container_width=True)

    # State preservation
    if "research_results" not in st.session_state:
        st.session_state["research_results"] = None

    if start_button:
        if not query.strip():
            st.warning("Please enter a research question first.")
            return

        progress_container = st.container()
        with progress_container:
            st.markdown("### 🔄 Research Execution in Progress")
            status_box = st.status("Initializing autonomous research pipeline...", expanded=True)
            
            step_logs = []
            def on_step_update(step_name: str, detail: str):
                step_logs.append(f"✓ {detail}")
                status_box.write(f"• **{step_name.replace('_', ' ').title()}**: {detail}")

            try:
                agent = AutonomousResearchAgent()
                results = agent.run_research(
                    question=query.strip(),
                    depth=depth,
                    step_callback=on_step_update,
                )
                status_box.update(label=f"✓ Research finished successfully in {results['duration_seconds']}s!", state="complete")
                st.session_state["research_results"] = results
            except Exception as e:
                status_box.update(label=f"❌ Error during research: {str(e)}", state="error")
                st.error(f"Research halted due to an unexpected error: {str(e)}")
                return

    # Results Display
    if st.session_state["research_results"]:
        results = st.session_state["research_results"]
        st.markdown("---")
        st.subheader("📊 Research Results")

        tab_overview, tab_sources, tab_findings, tab_report = st.tabs([
            "📌 Overview",
            "🌐 Sources Discovered",
            "🔍 Key Findings",
            "📄 Research Report",
        ])

        # TAB 1: OVERVIEW
        with tab_overview:
            c1, c2, c3, c4 = st.columns(4)
            with c1:
                st.metric("Total Searches", len(results["queries"]))
            with c2:
                st.metric("Sources Discovered", len(results["all_sources"]))
            with c3:
                st.metric("Useful Sources", results["useful_sources_count"])
            with c4:
                st.metric("Duration", f"{results['duration_seconds']}s")

            st.write("#### Research Question")
            st.info(results["question"])

            st.write("#### Autonomous Queries Generated")
            for q in results["queries"]:
                st.write(f"- 🔎 `{q}`")

            citation_stats = results.get("citation_stats", {})
            st.write("#### Citation Integrity")
            if citation_stats.get("is_valid"):
                st.success(f"✓ All {len(citation_stats.get('referenced_ids', []))} citations in the report strictly match verified web sources.")
            else:
                st.warning(f"Unmatched citations detected: {citation_stats.get('hallucinated_ids')}")

        # TAB 2: SOURCES
        with tab_sources:
            sources_list = results["all_sources"]
            if sources_list:
                df = pd.DataFrame([
                    {
                        "Citation": f"[{s['id']}]",
                        "Title": s["title"],
                        "Domain": s.get("domain", "web"),
                        "Relevance Score": f"{s.get('relevance_score', 0.8):.2f}",
                        "URL": s["url"],
                    }
                    for s in sources_list
                ])
                st.dataframe(df, use_container_width=True)

                st.write("#### Source Detail Cards")
                for s in sources_list:
                    with st.expander(f"[{s['id']}] {s['title']} ({s.get('domain', 'web')})"):
                        st.markdown(f"**URL**: [{s['url']}]({s['url']})")
                        st.markdown(f"**Relevance Score**: `{s.get('relevance_score', 0.8):.2f}`")
                        st.markdown(f"**Snippet**: {s.get('snippet', 'No snippet available')}")
            else:
                st.write("No sources available.")

        # TAB 3: FINDINGS
        with tab_findings:
            synthesis = results.get("synthesis", {})
            st.write("#### Key Findings & Evidence")
            for f in synthesis.get("findings", []):
                st.markdown(f'<div class="finding-box">💡 {f}</div>', unsafe_allow_html=True)

            col_a, col_b = st.columns(2)
            with col_a:
                st.write("#### Advantages")
                for adv in synthesis.get("advantages", []):
                    st.write(f"✅ {adv}")

            with col_b:
                st.write("#### Limitations & Trade-offs")
                for lim in synthesis.get("limitations", []):
                    st.write(f"⚠️ {lim}")

            st.write("#### Points of Agreement")
            for c in synthesis.get("consensus", []):
                st.write(f"🤝 {c}")

            st.write("#### Contradictions & Perspectives")
            for cd in synthesis.get("contradictions", []):
                st.write(f"⚖️ {cd}")

        # TAB 4: RESEARCH REPORT
        with tab_report:
            report_md = results.get("report_markdown", "")
            
            # Download button
            filename = f"research_report_{int(time.time())}.md"
            st.download_button(
                label="📥 Download Research Report (.md)",
                data=report_md,
                file_name=filename,
                mime="text/markdown",
                type="primary",
            )

            st.markdown("---")
            st.markdown(report_md)


if __name__ == "__main__":
    main()
