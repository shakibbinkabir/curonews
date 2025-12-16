<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Redirect legacy login route to Filament panel login path
Route::get('/login', function () {
    return redirect('/admin/login');
})->name('login');
