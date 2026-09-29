<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StoredFile
{
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $relative = ltrim($path, '/');

        if (is_file(public_path('uploads/'.$relative))) {
            return '/uploads/'.$relative;
        }

        if (Storage::disk('public')->exists($relative)) {
            return '/storage/'.$relative;
        }

        return null;
    }

    public static function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'uploads');
    }

    public static function delete(?string $path): void
    {
        if (! $path) {
            return;
        }

        $relative = ltrim($path, '/');
        $upload = public_path('uploads/'.$relative);

        if (is_file($upload)) {
            unlink($upload);
        }

        if (Storage::disk('public')->exists($relative)) {
            Storage::disk('public')->delete($relative);
        }
    }
}
