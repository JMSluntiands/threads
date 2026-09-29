<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ConcernController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/concerns', [ConcernController::class, 'index']);
    Route::post('/concerns', [ConcernController::class, 'store']);
    Route::get('/concerns/{concern}', [ConcernController::class, 'show']);
    Route::patch('/concerns/{concern}/status', [ConcernController::class, 'updateStatus']);
    Route::patch('/concerns/{concern}/board', [ConcernController::class, 'updateBoard']);
    Route::patch('/concerns/{concern}/marks', [ConcernController::class, 'updateMarks']);
    Route::post('/concerns/{concern}/comments', [CommentController::class, 'store']);
});
Route::view('/{any?}', 'app')->where('any', '.*');
