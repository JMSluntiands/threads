<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'Threads') }}</title>
        @fonts
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        <style>
            html, body { margin: 0; min-height: 100%; background: #f6f5f2; color-scheme: light; }
            #app-loading {
                min-height: 100vh;
                display: grid;
                place-items: center;
                font-family: system-ui, sans-serif;
                color: #e8870c;
                background: #f6f5f2;
            }
        </style>
    </head>
    <body class="antialiased">
        <div id="app">
            <div id="app-loading">Loading Threads...</div>
        </div>
    </body>
</html>
