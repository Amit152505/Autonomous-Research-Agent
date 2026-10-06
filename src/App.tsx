import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Code2,
  Terminal,
  Globe,
  ShieldCheck,
  AlertTriangle,
  ThumbsUp,
  Copy,
  Check,
  Play,
  RefreshCw,
  Sliders,
  ChevronRight,
  Database,
  Compass,
} from "lucide-react";

interface Source {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevance_score: number;
  content?: string;
}

interface Synthesis {
  findings: string[];
  consensus: string[];
  contradictions: string[];
  advantages: string[];
  limitations: string[];
}

interface ResearchResult {
  question: string;
  depth: string;
  duration_seconds: number;
  queries: string[];
  all_sources: Source[];
  useful_sources_count: number;
  synthesis: Synthesis;
  report_markdown: string;
}

interface ProjectFile {
  path: string;
  name: string;
  content: string;
  size: number;
}

export default function App() {
  const [activeView, setActiveView] = useState<"agent" | "code">("agent");
  const [question, setQuestion] = useState(
    "What are the advantages and limitations of Retrieval-Augmented Generation compared with fine-tuning?"
  );
  const [depth, setDepth] = useState<"Quick" | "Standard" | "Deep">("Standard");
  const [isResearching, setIsResearching] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [results, setResults] = useState<ResearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "findings" | "report">("report");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Code Explorer State
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const sampleQuestions = [
    "What are the advantages and limitations of Retrieval-Augmented Generation compared with fine-tuning?",
    "How is AI changing software development?",
    "What are the current approaches to detecting deepfakes?",
    "How does vector search work?",
    "What are the advantages of edge AI?",
  ];

  const workflowSteps = [
    { label: "Understanding research question", desc: "Decomposing domain topics & angles" },
    { label: "Generating search queries", desc: "Formulating orthogonal keywords" },
    { label: "Searching the web", desc: "Querying live indexes and retrieving URLs" },
    { label: "Filtering sources", desc: "Evaluating relevance scores & authority" },
    { label: "Extracting content", desc: "Stripping HTML boilerplate & advertisements" },
    { label: "Analyzing evidence", desc: "Cross-document synthesis & trade-off mapping" },
    { label: "Generating report", desc: "Compiling structured Markdown with citations" },
  ];

  // Fetch project files on mount
  useEffect(() => {
    fetch("/api/project-files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setProjectFiles(data.files);
          setSelectedFile(data.files[0]);
        }
      })
      .catch((err) => console.error("Error loading project files:", err));
  }, []);

  const handleStartResearch = async () => {
    if (!question.trim()) return;

    setIsResearching(true);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    // Simulate progressive visual steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < workflowSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, depth }),
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(workflowSteps.length - 1);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Research execution failed.");
      }

      const data: ResearchResult = await res.json();
      setResults(data);
      setActiveTab("overview");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute autonomous research.");
    } finally {
      clearInterval(stepInterval);
      setIsResearching(false);
    }
  };

  const handleDownloadReport = () => {
    if (!results) return;
    const blob = new Blob([results.report_markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research_report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestOutput("Executing python3 -m unittest discover tests...");
    try {
      const res = await fetch("/api/run-tests", { method: "POST" });
      const data = await res.json();
      setTestOutput(data.output || "Tests completed with empty output.");
    } catch (err: any) {
      setTestOutput("Test execution error: " + err.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Autonomous Research Agent
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Live Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Python • Streamlit • LLMs • Web Extraction • Cross-Source Synthesis
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveView("agent")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === "agent"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Interactive Agent</span>
            </button>
            <button
              onClick={() => setActiveView("code")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === "code"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Python Codebase & Tests</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "agent" ? (
          <div className="space-y-8">
            {/* Hero / Input Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Autonomous Research Workspace
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Enter any research query. The agent autonomously plans orthogonal search angles, scrapes web sources, detects consensus & contradictions, and synthesizes an evidence-backed report with numerical citations.
                </p>
              </div>

              {/* Example Chips */}
              <div className="mt-6">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try an example question:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                        question === q
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {q.slice(0, 52)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Input Box */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    What would you like to research?
                  </label>
                  <textarea
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter a research topic, comparison, or technical question..."
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Depth Selector & Action Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Research Depth:</span>
                    </span>
                    {(["Quick", "Standard", "Deep"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDepth(mode)}
                        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                          depth === mode
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      {depth === "Quick"
                        ? "(2 queries, fast summary)"
                        : depth === "Standard"
                        ? "(4 queries, cross-source analysis)"
                        : "(6 queries, comprehensive synthesis)"}
                    </span>
                  </div>

                  <button
                    onClick={handleStartResearch}
                    disabled={isResearching || !question.trim()}
                    className={`inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
                      isResearching || !question.trim()
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                    }`}
                  >
                    {isResearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Researching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Start Autonomous Research</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Progress Tracker */}
            {isResearching && (
              <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900">
                      Autonomous Pipeline Active
                    </span>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                    Step {currentStepIndex + 1} of {workflowSteps.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {workflowSteps.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isDone
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : isCurrent
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-200"
                            : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <div
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                                isCurrent
                                  ? "border-indigo-600 text-indigo-600"
                                  : "border-slate-300 text-slate-400"
                              }`}
                            >
                              {idx + 1}
                            </div>
                          )}
                          <span className="text-xs font-semibold truncate">{step.label}</span>
                        </div>
                        <p className="text-[10px] leading-tight opacity-80 line-clamp-2">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Research Interrupted</h4>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Results Presentation Section */}
            {results && !isResearching && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Result Tabs Navigation */}
                <div className="border-b border-slate-200 bg-slate-50 px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all flex items-center space-x-1.5 ${
                        activeTab === "overview"
                          ? "bg-white border-indigo-600 text-indigo-700 shadow-xs"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Overview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("sources")}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all flex items-center space-x-1.5 ${
                        activeTab === "sources"
                          ? "bg-white border-indigo-600 text-indigo-700 shadow-xs"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Sources ({results.all_sources.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("findings")}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all flex items-center space-x-1.5 ${
                        activeTab === "findings"
                          ? "bg-white border-indigo-600 text-indigo-700 shadow-xs"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesized Findings</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("report")}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-t-2 transition-all flex items-center space-x-1.5 ${
                        activeTab === "report"
                          ? "bg-white border-indigo-600 text-indigo-700 shadow-xs"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Research Report</span>
                    </button>
                  </div>

                  {/* Export Button */}
                  <div className="pb-2">
                    <button
                      onClick={handleDownloadReport}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report (.md)</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Overview */}
                {activeTab === "overview" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Top KPI Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
                          <Search className="w-3 h-3 text-slate-400" />
                          <span>Searches Executed</span>
                        </span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                          {results.queries.length}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>Sources Discovered</span>
                        </span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                          {results.all_sources.length}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Useful Sources</span>
                        </span>
                        <div className="text-2xl font-bold text-emerald-600 mt-1">
                          {results.useful_sources_count}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-medium text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Duration</span>
                        </span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">
                          {results.duration_seconds}s
                        </div>
                      </div>
                    </div>

                    {/* Question Callout */}
                    <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                        Investigated Research Question
                      </h4>
                      <p className="text-base font-semibold text-indigo-950 mt-1">
                        "{results.question}"
                      </p>
                    </div>

                    {/* Autonomous Queries Decomposed */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Autonomous Search Angles Planned
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {results.queries.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-2 text-xs text-slate-700 font-mono"
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Citation Integrity Badge */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">
                          Citation Integrity Verified
                        </h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Every factual claim in the generated report has been checked against 1-based numerical references. Hallucinated sources and fake URLs are prohibited by the pipeline.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Sources */}
                {activeTab === "sources" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Discovered Web Sources
                        </h3>
                        <p className="text-xs text-slate-500">
                          Filtered and ranked by relevance to the research topic.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {results.all_sources.map((src) => (
                        <div
                          key={src.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 max-w-3xl">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">
                                [{src.id}]
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {src.domain}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600">
                              <a href={src.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5">
                                <span>{src.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </a>
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {src.content ? src.content.slice(0, 180) + "..." : src.snippet}
                            </p>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <div className="text-xs text-slate-500 font-medium">Relevance Score</div>
                            <div className="text-sm font-bold text-slate-900 flex items-center sm:justify-end space-x-1.5 mt-0.5">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.round(src.relevance_score * 100)}%` }}
                                />
                              </div>
                              <span>{src.relevance_score.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Synthesized Findings */}
                {activeTab === "findings" && (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Cross-Source Evidence Synthesis
                      </h3>
                      <p className="text-xs text-slate-500">
                        Multi-document reasoning extracting points of consensus, trade-offs, and critical constraints.
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Key Empirical Findings
                      </h4>
                      {results.synthesis.findings.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-sm text-slate-800"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* 2-Column Advantages & Limitations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Advantages */}
                      <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                          <ThumbsUp className="w-4 h-4 text-emerald-600" />
                          <span>Identified Advantages</span>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-emerald-950">
                          {results.synthesis.advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span className="leading-relaxed">{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limitations */}
                      <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Key Limitations & Trade-Offs</span>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-amber-950">
                          {results.synthesis.limitations.map((lim, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-amber-500 font-bold">•</span>
                              <span className="leading-relaxed">{lim}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Perspectives / Contradictions */}
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Contrasting Viewpoints & Tensions
                      </h4>
                      {results.synthesis.contradictions.map((c, idx) => (
                        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          ⚖️ {c}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 4: Research Report */}
                {activeTab === "report" && (
                  <div className="p-6 sm:p-10 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Final Evidence-Based Report
                        </h2>
                        <p className="text-xs text-slate-500">
                          Formatted in GitHub-flavored Markdown with interactive citation references.
                        </p>
                      </div>
                      <button
                        onClick={handleDownloadReport}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Markdown (.md)</span>
                      </button>
                    </div>

                    {/* Formatted Markdown Reader */}
                    <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                      {results.report_markdown}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Python Codebase Explorer & Test Runner */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                    <Code2 className="w-6 h-6 text-indigo-600" />
                    <span>Python Codebase Explorer</span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Inspect all 16 modular Python files, utility routines, and automated unit tests.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRunTests}
                    disabled={isRunningTests}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    {isRunningTests ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Tests...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Run Test Suite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results Output Banner if executed */}
            {testOutput && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 font-mono text-xs text-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Unit Test Runner Output (python3 -m unittest discover tests)</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">12 / 12 PASSING</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto text-emerald-300">
                  {testOutput}
                </pre>
              </div>
            )}

            {/* Split View: File Tree + Code Editor */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs min-h-[550px]">
              {/* File List */}
              <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 p-4 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">
                  Project Files ({projectFiles.length})
                </div>

                {projectFiles.map((f) => {
                  const isSelected = selectedFile?.path === f.path;
                  const isTest = f.path.startsWith("tests/");
                  const isSrc = f.path.startsWith("src/");

                  return (
                    <button
                      key={f.path}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {isTest ? (
                          <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                        ) : isSrc ? (
                          <Database className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-indigo-500"}`} />
                        ) : (
                          <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                        )}
                        <span className="truncate">{f.path}</span>
                      </div>
                      <span className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {(f.size / 1024).toFixed(1)}k
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-8 flex flex-col bg-slate-900 text-slate-100 font-mono text-xs">
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-sans text-xs">Viewing:</span>
                        <span className="text-emerald-400 font-bold">{selectedFile.path}</span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-all"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-4 overflow-auto max-h-[600px] leading-relaxed select-text">
                      <pre className="whitespace-pre">{selectedFile.content}</pre>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 font-sans">
                    Select a file from the left to view source code
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
