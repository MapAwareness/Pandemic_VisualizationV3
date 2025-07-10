import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Activity, TrendingUp, AlertTriangle, Download, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prédictions Pandémie',
        href: '/pandemic/predictions',
    },
];

const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

interface PredictionData {
    country: string;
    coordinates: [number, number];
    cases: number;
    predicted_cases: number;
    growth_rate: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface FormData {
    disease: string;
    year: number;
    month: number;
    current_cases: number;
    active_cases: number;
}

export default function PandemicPredictions() {
    // Configuration API depuis l'environnement
    const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:5000';
    
    const [formData, setFormData] = useState<FormData>({
        disease: 'corona',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        current_cases: 100,
        active_cases: 50,
    });

    const [prediction, setPrediction] = useState<object | null>(null);
    const [mapData, setMapData] = useState<PredictionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

    // Couleurs pour les niveaux de risque
    const riskColors = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626'
    };

    // Scale pour la taille des marqueurs
    const sizeScale = scaleLinear()
        .domain([0, 100000])
        .range([4, 20]);

    useEffect(() => {
        fetchMapData();
    }, []);

    // Fonction utilitaire pour les appels API avec gestion d'erreurs
    const callAPI = async <T = FormData>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: T) => {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`🔗 Appel API: ${method} ${url}`);
            
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            };
            
            if (body) {
                options.body = JSON.stringify(body);
                console.log('📤 Body:', body);
            }
            
            const response = await fetch(url, options);
            console.log(`📊 Status: ${response.status}`);
            
            // Vérifier si la réponse est du JSON
            const contentType = response.headers.get('content-type');
            console.log(`📋 Content-Type: ${contentType}`);
            
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Réponse non-JSON:', text.substring(0, 200));
                throw new Error('La réponse du serveur n\'est pas au format JSON');
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Données reçues:', data);
            return data;
        } catch (error) {
            console.error('🚨 Erreur API:', error);
            throw error;
        }
    };

    // Récupérer les données de la carte (simulées pour le moment)
    const fetchMapData = async () => {
        try {
            // Utilisez des données simulées en attendant que l'API soit opérationnelle
            const simulatedData = [
                {
                    country: 'France',
                    coordinates: [2.3522, 48.8566] as [number, number],
                    cases: 50000,
                    predicted_cases: 75000,
                    growth_rate: 15.5,
                    risk_level: 'medium' as const
                },
                {
                    country: 'Italy',
                    coordinates: [12.4964, 41.9028] as [number, number],
                    cases: 60000,
                    predicted_cases: 95000,
                    growth_rate: 22.3,
                    risk_level: 'high' as const
                },
                {
                    country: 'Germany',
                    coordinates: [13.4050, 52.5200] as [number, number],
                    cases: 45000,
                    predicted_cases: 60000,
                    growth_rate: 12.1,
                    risk_level: 'medium' as const
                },
                {
                    country: 'Spain',
                    coordinates: [-3.7038, 40.4168] as [number, number],
                    cases: 70000,
                    predicted_cases: 120000,
                    growth_rate: 28.7,
                    risk_level: 'critical' as const
                }
            ];
            
            setMapData(simulatedData);
            console.log('✅ Données de carte chargées (simulées)');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données de carte:', error);
            // En cas d'erreur, utilisez des données par défaut
            setMapData([]);
        }
    };

    // Prédiction avec l'API IA
    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await callAPI('/predict', 'POST', {
                disease: formData.disease,
                year: formData.year,
                month: formData.month,
                current_cases: formData.current_cases,
                active_cases: formData.active_cases
            });
            
            setPrediction(data);
            await fetchMapData(); // Actualiser les données de la carte
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Erreur de prédiction: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Test de connexion à l'API
    const testAPIConnection = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await callAPI('/model-info');
            console.log('✅ Connexion API réussie:', data);
            setError(null);
            alert('Connexion API réussie !');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(`Test de connexion échoué: ${errorMessage}`);
            console.error('❌ Test de connexion échoué:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const exportData = () => {
        const dataStr = JSON.stringify(mapData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `pandemic_predictions_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prédictions Pandémie" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Header avec diagnostic */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Prédictions de Pandémie
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Visualisation mondiale des prédictions épidémiologiques
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={testAPIConnection}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                            <Activity className="w-4 h-4" />
                            Test API
                        </button>
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                        </button>
                        <button
                            onClick={fetchMapData}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* Prediction Form */}
                <div className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Nouvelle Prédiction
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maladie
                            </label>
                            <select
                                value={formData.disease}
                                onChange={(e) => handleInputChange('disease', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="corona">Corona</option>
                                <option value="variole">Variole</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Année
                            </label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mois
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={formData.month}
                                onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cas actuels
                            </label>
                            <input
                                type="number"
                                value={formData.current_cases}
                                onChange={(e) => handleInputChange('current_cases', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cas actifs
                            </label>
                            <input
                                type="number"
                                value={formData.active_cases}
                                onChange={(e) => handleInputChange('active_cases', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Activity className="w-5 h-5" />
                        {loading ? 'Prédiction en cours...' : 'Prédire'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {prediction && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                                Résultat de la prédiction
                            </h3>
                        </div>
                        <pre className="text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/20 p-3 rounded overflow-x-auto">
                            {JSON.stringify(prediction, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Interactive Map avec données par défaut */}
                <div className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Carte Mondiale des Prédictions
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Cliquez sur un pays pour voir les détails
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Faible</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Modéré</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Élevé</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Critique</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative h-96 overflow-hidden">
                        {mapData.length > 0 ? (
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: 100,
                                    center: [0, 0],
                                }}
                                width={800}
                                height={400}
                            >
                                <ZoomableGroup>
                                    <Geographies geography={geoUrl}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill="#E5E7EB"
                                                    stroke="#D1D5DB"
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: {
                                                            fill: "#E5E7EB",
                                                            outline: "none",
                                                        },
                                                        hover: {
                                                            fill: "#D1D5DB",
                                                            outline: "none",
                                                        },
                                                        pressed: {
                                                            fill: "#9CA3AF",
                                                            outline: "none",
                                                        },
                                                    }}
                                                />
                                            ))
                                        }
                                    </Geographies>
                                    
                                    {mapData.map((location) => (
                                        <Marker
                                            key={location.country}
                                            coordinates={location.coordinates}
                                            onClick={() => setSelectedCountry(location.country)}
                                        >
                                            <circle
                                                r={sizeScale(location.predicted_cases)}
                                                fill={riskColors[location.risk_level]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <text
                                                textAnchor="middle"
                                                y={sizeScale(location.predicted_cases) + 15}
                                                style={{
                                                    fontFamily: 'system-ui',
                                                    fill: '#374151',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {location.country}
                                            </text>
                                        </Marker>
                                    ))}
                                </ZoomableGroup>
                            </ComposableMap>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Aucune donnée de carte disponible
                                    </p>
                                    <button
                                        onClick={fetchMapData}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Charger les données
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Country Details */}
                {selectedCountry && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Détails pour {selectedCountry}
                        </h3>
                        {mapData.find(d => d.country === selectedCountry) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cas actuels</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {mapData.find(d => d.country === selectedCountry)?.cases.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cas prédits</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {mapData.find(d => d.country === selectedCountry)?.predicted_cases.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Taux de croissance</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {mapData.find(d => d.country === selectedCountry)?.growth_rate.toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Niveau de risque</p>
                                    <p className="text-2xl font-bold" style={{ 
                                        color: riskColors[mapData.find(d => d.country === selectedCountry)?.risk_level || 'low'] 
                                    }}>
                                        {mapData.find(d => d.country === selectedCountry)?.risk_level.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
