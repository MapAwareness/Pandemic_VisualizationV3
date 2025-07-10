<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            // Cache les stats pour 5 minutes
            $stats = Cache::remember('dashboard_stats', 300, function () {
                $aiApiUrl = env('AI_API_URL', 'http://localhost:8000');
                
                // Récupérer les stats de l'API IA
                $modelInfo = $this->callAiApi($aiApiUrl . '/model-info');
                
                return [
                    'totalPredictions' => rand(1000, 5000), // À remplacer par vraies données
                    'activeDiseases' => 2,
                    'lastPredictionAccuracy' => $modelInfo['corona_model_accuracy'] ?? 85.5,
                    'processingTime' => rand(150, 300),
                    'recentPredictions' => [
                        [
                            'disease' => 'corona',
                            'predicted_cases' => 1500,
                            'accuracy' => 87.2,
                            'timestamp' => now()->subHours(2)->toISOString()
                        ],
                        [
                            'disease' => 'variole',
                            'predicted_cases' => 850,
                            'accuracy' => 92.1,
                            'timestamp' => now()->subHours(5)->toISOString()
                        ]
                    ]
                ];
            });

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getMapData()
    {
        try {
            // Données simulées pour la carte
            $mapData = [
                [
                    'country' => 'France',
                    'coordinates' => [2.3522, 48.8566],
                    'cases' => 50000,
                    'predicted_cases' => 75000,
                    'growth_rate' => 15.5,
                    'risk_level' => 'medium'
                ],
                [
                    'country' => 'Italy',
                    'coordinates' => [12.4964, 41.9028],
                    'cases' => 60000,
                    'predicted_cases' => 95000,
                    'growth_rate' => 22.3,
                    'risk_level' => 'high'
                ],
                [
                    'country' => 'Germany',
                    'coordinates' => [13.4050, 52.5200],
                    'cases' => 45000,
                    'predicted_cases' => 60000,
                    'growth_rate' => 12.1,
                    'risk_level' => 'medium'
                ],
                [
                    'country' => 'Spain',
                    'coordinates' => [-3.7038, 40.4168],
                    'cases' => 70000,
                    'predicted_cases' => 120000,
                    'growth_rate' => 28.7,
                    'risk_level' => 'critical'
                ]
            ];

            return response()->json($mapData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des données de la carte',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function callAiApi($url, $data = [], $method = 'GET')
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
            ],
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception('API call failed with status: ' . $httpCode);
        }

        return json_decode($response, true);
    }
}