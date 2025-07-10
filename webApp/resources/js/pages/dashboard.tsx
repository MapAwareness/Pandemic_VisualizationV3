// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, TrendingUp, Users, Globe, AlertTriangle, BarChart3, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalPredictions: number;
    activeDiseases: number;
    lastPredictionAccuracy: number;
    processingTime: number;
    recentPredictions: Array<{
        disease: string;
        predicted_cases: number;
        accuracy: number;
        timestamp: string;
    }>;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalPredictions: 0,
        activeDiseases: 0,
        lastPredictionAccuracy: 0,
        processingTime: 0,
        recentPredictions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Nouvelle Prédiction',
            description: 'Créer une prédiction pandémique',
            href: '/pandemic/predictions',
            icon: Activity,
            color: 'bg-blue-500 dark:bg-blue-600'
        },
        {
            title: 'Visualisation Carte',
            description: 'Voir les données sur la carte mondiale',
            href: '/pandemic/map',
            icon: MapPin,
            color: 'bg-green-500 dark:bg-green-600'
        },
        {
            title: 'Historique',
            description: 'Consulter l\'historique des prédictions',
            href: '/pandemic/history',
            icon: Clock,
            color: 'bg-purple-500 dark:bg-purple-600'
        },
        {
            title: 'Rapports',
            description: 'Générer des rapports analytiques',
            href: '/pandemic/reports',
            icon: BarChart3,
            color: 'bg-orange-500 dark:bg-orange-600'
        }
    ];

    const StatCard = ({ title, value, icon: Icon, trend, color }: {
        title: string;
        value: string | number;
        icon: React.ElementType;
        trend?: string;
        color: string;
    }) => (
        <div className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    {trend && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            <TrendingUp className="inline w-3 h-3 mr-1" />
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Tableau de Bord
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Surveillance et prédiction des pandémies en temps réel
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            API IA Active
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Prédictions"
                        value={loading ? "..." : stats.totalPredictions.toLocaleString()}
                        icon={Activity}
                        trend=""
                        color="bg-blue-500 dark:bg-blue-600"
                    />
                    <StatCard
                        title="Maladies Surveillées"
                        value={loading ? "..." : stats.activeDiseases}
                        icon={Users}
                        trend=""
                        color="bg-green-500 dark:bg-green-600"
                    />
                    <StatCard
                        title="Précision Modèle"
                        value={loading ? "..." : `${stats.lastPredictionAccuracy.toFixed(1)}%`}
                        icon={TrendingUp}
                        trend=""
                        color="bg-purple-500 dark:bg-purple-600"
                    />
                    <StatCard
                        title="Temps de Traitement"
                        value={loading ? "..." : `${stats.processingTime}ms`}
                        icon={Globe}
                        trend=""
                        color="bg-orange-500 dark:bg-orange-600"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {action.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity & Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Predictions */}
                    <div className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Prédictions Récentes
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : stats.recentPredictions.length > 0 ? (
                                stats.recentPredictions.map((pred, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {pred.disease}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {pred.predicted_cases.toLocaleString()} cas prédits
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                {pred.accuracy.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(pred.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Aucune prédiction récente
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-sidebar rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            État du Système
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100">API IA</span>
                                </div>
                                <span className="text-sm text-green-600 dark:text-green-400">Opérationnelle</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100">Base de données</span>
                                </div>
                                <span className="text-sm text-green-600 dark:text-green-400">Opérationnelle</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100">Modèle ML</span>
                                </div>
                                <span className="text-sm text-yellow-600 dark:text-yellow-400">Entraînement</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-900 dark:text-gray-100">Cache Redis</span>
                                </div>
                                <span className="text-sm text-green-600 dark:text-green-400">Opérationnel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
