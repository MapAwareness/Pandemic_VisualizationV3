// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Prédictions Pandémie',
        href: '/pandemic-predictions',
    },
];

export default function PandemicPredictions() {
    // States pour les inputs et les résultats
    const [disease, setDisease] = useState('corona');
    const [year, setYear] = useState(2024);
    const [month, setMonth] = useState(6);
    const [currentCases, setCurrentCases] = useState(100);
    const [activeCases, setActiveCases] = useState(50);
    const [prediction, setPrediction] = useState<object | null>(null);
    const [totalCases, setTotalCases] = useState<object | null>(null);
    const [modelInfo, setModelInfo] = useState<object | null>(null);
    const [processedData, setProcessedData] = useState<object | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Appel à /predict
    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/pandemic/predict', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    disease,
                    year: Number(year),
                    month: Number(month),
                    current_cases: Number(currentCases),
                    active_cases: Number(activeCases)
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la prédiction');
            }
            setPrediction(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // Appel à /predict-total-cases
    const handlePredictTotalCases = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/pandemic/predict-total-cases', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    disease,
                    year: Number(year),
                    month: Number(month),
                    current_cases: Number(currentCases),
                    active_cases: Number(activeCases)
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la prédiction');
            }
            setTotalCases(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // Appel à /model-info
    const handleGetModelInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/pandemic/model-info');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des infos du modèle');
            }
            setModelInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // Appel à /api/processed-data
    const handleGetProcessedData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/pandemic/processed-data?page=1&page_size=5');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des données');
            }
            setProcessedData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prédictions Pandémie" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        Prédictions de Pandémie
                    </h2>
                    
                    {/* Formulaire de saisie */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maladie
                            </label>
                            <select 
                                value={disease} 
                                onChange={e => setDisease(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="corona">Covid-19</option>
                                <option value="variole">Variole du singe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Année
                            </label>
                            <input 
                                type="number" 
                                value={year} 
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mois
                            </label>
                            <input 
                                type="number" 
                                value={month} 
                                onChange={e => setMonth(Number(e.target.value))} 
                                min="1" 
                                max="12"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cas actuels
                            </label>
                            <input 
                                type="number" 
                                value={currentCases} 
                                onChange={e => setCurrentCases(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cas actifs
                            </label>
                            <input 
                                type="number" 
                                value={activeCases} 
                                onChange={e => setActiveCases(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button 
                            onClick={handlePredict}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Prédire les cas'}
                        </button>
                        <button 
                            onClick={handlePredictTotalCases}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Prédire le total'}
                        </button>
                        <button 
                            onClick={handleGetModelInfo}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Info du modèle'}
                        </button>
                        <button 
                            onClick={handleGetProcessedData}
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Données traitées'}
                        </button>
                    </div>

                    {/* Affichage des erreurs */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            <strong>Erreur:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Affichage des résultats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {prediction && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Prédiction
                            </h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(prediction, null, 2)}
                            </pre>
                        </div>
                    )}
                    
                    {totalCases && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Prédiction du total des cas
                            </h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(totalCases, null, 2)}
                            </pre>
                        </div>
                    )}
                    
                    {modelInfo && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Informations du modèle
                            </h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(modelInfo, null, 2)}
                            </pre>
                        </div>
                    )}
                    
                    {processedData && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                Données traitées (page 1, 5 éléments)
                            </h4>
                            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto text-sm">
                                {JSON.stringify(processedData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
