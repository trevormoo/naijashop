<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'NaijaShop API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
});
