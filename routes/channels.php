<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat-channel', function () {
    return true;
});