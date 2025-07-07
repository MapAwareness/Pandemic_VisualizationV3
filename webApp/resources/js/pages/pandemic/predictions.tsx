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
    // API configuration from environment variables
    const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:5000';

    // States pour les inputs et les résultats
    const [disease, setDisease] = useState('corona');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7)); // Format YYYY-MM
    const [currentCases, setCurrentCases] = useState(100);
    const [activeCases, setActiveCases] = useState(50);
    const [prediction, setPrediction] = useState<object | null>(null);
    const [totalCases, setTotalCases] = useState<object | null>(null);
    const [modelInfo, setModelInfo] = useState<object | null>(null);
    const [processedData, setProcessedData] = useState<object | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fonctions pour extraire année et mois de la date sélectionnée
    const getYearFromDate = () => new Date(selectedDate + '-01').getFullYear();
    const getMonthFromDate = () => new Date(selectedDate + '-01').getMonth() + 1;

    // Appel à /predict (mise à jour)
    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL+'/predict', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Retirez le token CSRF pour les appels API externes
                },
                body: JSON.stringify({
                    disease,
                    year: getYearFromDate(),
                    month: getMonthFromDate(),
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
            const response = await fetch(API_BASE_URL+'/predict-total-cases', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    disease,
                    year: getYearFromDate(),
                    month: getMonthFromDate(),
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
            const response = await fetch(API_BASE_URL+'/model-info');
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
            const response = await fetch(API_BASE_URL+'/api/processed-data?page=1&page_size=5');
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
                <div className="bg-sidebar rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        Prédictions de Pandémie
                    </h2>
                    
                    {/* Formulaire de saisie */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
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
                        
                        {/* Nouveau sélecteur de date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mois et Année
                            </label>
                            <input 
                                type="month"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
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
                            className="px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 rounded-md hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Prédire les cas'}
                        </button>
                        <button 
                            onClick={handlePredictTotalCases}
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90  rounded-md hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Prédire le total'}
                        </button>
                        <button 
                            onClick={handleGetModelInfo}
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90  rounded-md hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Info du modèle'}
                        </button>
                        <button 
                            onClick={handleGetProcessedData}
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90  rounded-md hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
