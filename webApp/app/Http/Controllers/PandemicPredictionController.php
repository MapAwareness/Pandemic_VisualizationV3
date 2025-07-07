<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PandemicPredictionController extends Controller
{
    /**
     * Display the pandemic predictions page.
     */
    public function index()
    {
        return Inertia::render('pandemic/predictions');
    }

    /**
     * Proxy to AI API for predictions
     */
    public function predict(Request $request)
    {
        $request->validate([
            'disease' => 'required|string|in:corona,variole',
            'year' => 'required|integer|min:2020|max:2030',
            'month' => 'required|integer|min:1|max:12',
            'current_cases' => 'required|integer|min:0',
            'active_cases' => 'required|integer|min:0',
        ]);

        try {
            $aiApiUrl = env('AI_API_URL', 'http://localhost:8000');
            
            $response = $this->callAiApi($aiApiUrl . '/predict', [
                'disease' => $request->disease,
                'year' => $request->year,
                'month' => $request->month,
                'current_cases' => $request->current_cases,
                'active_cases' => $request->active_cases,
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'appel à l\'API IA',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Proxy to AI API for total cases prediction
     */
    public function predictTotalCases(Request $request)
    {
        $request->validate([
            'disease' => 'required|string|in:corona,variole',
            'year' => 'required|integer|min:2020|max:2030',
            'month' => 'required|integer|min:1|max:12',
            'current_cases' => 'required|integer|min:0',
            'active_cases' => 'required|integer|min:0',
        ]);

        try {
            $aiApiUrl = env('AI_API_URL', 'http://localhost:8000');
            
            $response = $this->callAiApi($aiApiUrl . '/predict-total-cases', [
                'disease' => $request->disease,
                'year' => $request->year,
                'month' => $request->month,
                'current_cases' => $request->current_cases,
                'active_cases' => $request->active_cases,
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'appel à l\'API IA',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get model information from AI API
     */
    public function getModelInfo()
    {
        try {
            $aiApiUrl = env('AI_API_URL', 'http://localhost:8000');
            
            $response = $this->callAiApi($aiApiUrl . '/model-info', [], 'GET');

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'appel à l\'API IA',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get processed data from AI API
     */
    public function getProcessedData(Request $request)
    {
        $page = $request->get('page', 1);
        $pageSize = $request->get('page_size', 5);

        try {
            $aiApiUrl = env('AI_API_URL', 'http://localhost:8000');
            
            $response = $this->callAiApi($aiApiUrl . '/api/processed-data?page=' . $page . '&page_size=' . $pageSize, [], 'GET');

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'appel à l\'API IA',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to call AI API
     */
    private function callAiApi($url, $data = [], $method = 'POST')
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
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new \Exception('Erreur cURL: ' . $error);
        }

        if ($httpCode >= 400) {
            throw new \Exception('Erreur HTTP: ' . $httpCode);
        }

        $decodedResponse = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Erreur de décodage JSON: ' . json_last_error_msg());
        }

        return $decodedResponse;
    }
}
