<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class MailService
{
    private function send(string $to, string $subject, string $html): void
    {
        try {
            Mail::html($html, fn ($message) => $message->to($to)->subject($subject));
        } catch (Throwable $e) {
            Log::error("Failed to send \"{$subject}\" to {$to}: ".$e->getMessage());
        }
    }

    public function sendOtp(string $to, string $firstName, string $code, int $ttlSeconds): void
    {
        $name = e($firstName);
        $minutes = (int) round($ttlSeconds / 60);
        $this->send($to, 'Your verification code', "<p>Hi {$name},</p>
<p>Your verification code is <strong style=\"font-size:20px;letter-spacing:4px\">{$code}</strong>.</p>
<p>It expires in {$minutes} minutes.</p>");
    }

    public function sendEmailApproved(string $to, string $firstName): void
    {
        $name = e($firstName);
        $this->send($to, 'Email verified', "<p>Hi {$name},</p>
<p>Your email address has been successfully approved. Your account is now awaiting administrator approval; we will email you once it is activated.</p>");
    }

    public function sendAccountApproved(string $to, string $firstName): void
    {
        $name = e($firstName);
        $url = e((string) config('assignment.frontend_login_url'));
        $this->send($to, 'Your account has been approved', "<p>Hi {$name},</p>
<p>Your account has been successfully approved. You can now log in here: <a href=\"{$url}\">{$url}</a></p>");
    }
}
