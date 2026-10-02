import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconAI from './ai.svelte';

export default function AiNotification($$anchor) {
	IconAI($$anchor, { notification: true });
}