<?php

use App\Http\Controllers\PandemicPredictionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Routes pour les prédictions de pandémie
    Route::get('pandemic/predictions', [PandemicPredictionController::class, 'index'])->name('predictions');
    Route::post('api/pandemic/predict', [PandemicPredictionController::class, 'predict'])->name('pandemic.predict');
    Route::post('api/pandemic/predict-total-cases', [PandemicPredictionController::class, 'predictTotalCases'])->name('pandemic.predict-total-cases');
    Route::get('api/pandemic/model-info', [PandemicPredictionController::class, 'getModelInfo'])->name('pandemic.model-info');
    Route::get('api/pandemic/processed-data', [PandemicPredictionController::class, 'getProcessedData'])->name('pandemic.processed-data');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
