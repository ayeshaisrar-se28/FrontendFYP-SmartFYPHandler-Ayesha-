import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, Search, Info, Github, ExternalLink, FileText } from 'lucide-react';
import noveltyService from '../../services/noveltyService';

const NoveltyCheckModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const [loadingText, setLoadingText] = useState('Initializing AI Model...');

    useEffect(() => {
        if (!loading) return;
        const steps = [
            "Connecting to Neural Engine...",
            "Vectorizing your Abstract...",
            "Scanning using Internal Database...",
            "Searching GitHub (Live)...",
            "Analyzing Research Papers (ArXiv)...",
            "Calculating Novelty Score..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setLoadingText(steps[i % steps.length]);
            i++;
        }, 1500);
        return () => clearInterval(interval);
    }, [loading]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await noveltyService.analyzeIdea({ title, abstract });
            if (response && response.data) {
                const data = { ...response.data };
                const maxInternal = data.maxInternalSimilarity || 0;
                const maxGithub = data.maxGithubSimilarity || 0;
                const maxPaper = data.maxPaperSimilarity || 0;
                
                const overallMaxSimilarity = Math.max(maxInternal, maxGithub, maxPaper);
                
                // Recalculate originality score to be derived directly from the max of the three sources
                const newScore = Math.max(0, Math.round(100 - (overallMaxSimilarity * 100)));
                data.originalityScore = newScore;
                
                // Also overwrite the explanation from the backend with the correct dynamic values
                const percentage = (overallMaxSimilarity * 100).toFixed(0);
                if (newScore === 100) {
                    data.explanation = "Your idea appears completely unique based on our database.";
                } else {
                    const topMatch = (data.topMatches || data.matches || [])[0];
                    const matchName = topMatch ? `'${topMatch.title}'` : "an existing project";
                    data.explanation = `Your Originality Score (${newScore}%) is calculated by deducting the maximum similarity found (${percentage}%). The most similar project found was ${matchName} with a ${percentage}% match.`;
                }
                
                setResult(data);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to analyze idea. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score > 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score > 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getSimilarityColor = (similarity) => {
        if (similarity < 0.3) return 'bg-green-100 text-green-800';
        if (similarity < 0.7) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start w-full">
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center" id="modal-title">
                                        <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
                                        Check Idea Uniqueness
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* LOADING STATE */}
                                {loading && (
                                    <div className="text-center py-12 animate-fade-in">
                                        <div className="mx-auto w-16 h-16 relative mb-4">
                                            <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                                        </div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-1">Analyzing your Idea</h4>
                                        <p className="text-purple-600 font-medium animate-pulse">{loadingText}</p>
                                    </div>
                                )}

                                {/* INPUT FORM */}
                                {!result && !loading && (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 border"
                                                placeholder="e.g., Smart Traffic Management System"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-1">Project Abstract/Description</label>
                                            <textarea
                                                id="abstract"
                                                rows="6"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-3 border"
                                                placeholder="Describe your project idea, methodology, and expected outcomes..."
                                                value={abstract}
                                                onChange={(e) => setAbstract(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-red-700">{error}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                            <button
                                                type="submit"
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                                            >
                                                Analyze Idea
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* RESULTS */}
                                {result && !loading && (
                                    <div className="animate-fade-in">
                                        {/* Score Header */}
                                        <div className={`rounded-xl border p-6 mb-6 text-center ${getScoreColor(result.originalityScore)}`}>
                                            <h4 className="text-lg font-semibold mb-1">Originality Score</h4>
                                            <p className="text-5xl font-bold mb-2">{result.originalityScore}%</p>
                                            <p className="text-sm opacity-90">
                                                {result.originalityScore > 80 ? 'Great! This idea seems very unique.' :
                                                    result.originalityScore > 50 ? 'Moderate similarity found. Check sources below.' :
                                                        'High similarity detected. Your idea might duplicate existing work.'}
                                            </p>
                                        </div>

                                        {/* Source Breakdown */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Internal DB</p>
                                                <p className="text-xl font-bold text-gray-800">{(result.maxInternalSimilarity * 100).toFixed(0)}%</p>
                                                <p className="text-xs text-gray-400">Similarity</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">GitHub</p>
                                                <p className="text-xl font-bold text-gray-800">{(result.maxGithubSimilarity * 100).toFixed(0)}%</p>
                                                <p className="text-xs text-gray-400">Similarity</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Papers</p>
                                                <p className="text-xl font-bold text-gray-800">{(result.maxPaperSimilarity * 100).toFixed(0)}%</p>
                                                <p className="text-xs text-gray-400">Similarity</p>
                                            </div>
                                        </div>

                                        {/* Explanation Section */}
                                        {result.explanation && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                                                <div className="flex items-start">
                                                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-blue-800">
                                                        {result.explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Smart Suggestions */}
                                        {result.suggestions && result.suggestions.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                                                    AI Smart Suggestions
                                                </h4>
                                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                                    <ul className="space-y-2">
                                                        {result.suggestions.map((suggestion, idx) => (
                                                            <li key={idx} className="flex items-start text-sm text-gray-700">
                                                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                                                {suggestion}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Matches List */}
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Search className="h-5 w-5 mr-2 text-gray-500" />
                                            Top Matches Details
                                        </h4>

                                        {result.matches && result.matches.length > 0 ? (
                                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                                {result.matches.map((match, idx) => (
                                                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-colors hover:bg-gray-100">
                                                        <div className="flex justify-between items-start mb-2">
                                                            {match.url ? (
                                                                <a href={match.url} target="_blank" rel="noopener noreferrer" className="group flex items-center font-medium text-blue-700 hover:text-blue-900">
                                                                    {match.title}
                                                                    <Search className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
                                                                </a>
                                                            ) : (
                                                                <h5 className="font-medium text-gray-900">
                                                                    {match.title}
                                                                </h5>
                                                            )}
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSimilarityColor(match.similarity)}`}>
                                                                {(match.similarity * 100).toFixed(0)}% Match
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center flex-wrap gap-2 mb-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded border inline-flex items-center ${match.sourceType === 'GitHub' ? 'bg-gray-800 text-white border-gray-700' :
                                                                match.sourceType === 'ResearchPaper' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    'bg-blue-100 text-blue-800 border-blue-200'
                                                                }`}>
                                                                {match.sourceType === 'InternalFyp' ? 'Internal DB' : match.sourceType}
                                                            </span>
                                                            {match.year && <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">Year: {match.year}</span>}

                                                            {match.url && (
                                                                <a href={match.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-0.5 rounded inline-flex items-center transition-colors">
                                                                    Visit Source &rarr;
                                                                </a>
                                                            )}
                                                        </div>
                                                        {match.snippet && (
                                                            <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 italic">
                                                                "...{match.snippet}..."
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                                <p className="text-gray-600">No similar projects found in our database.</p>
                                            </div>
                                        )}

                                        <div className="mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setResult(null)}
                                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
                                            >
                                                Check Another Idea
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoveltyCheckModal;
