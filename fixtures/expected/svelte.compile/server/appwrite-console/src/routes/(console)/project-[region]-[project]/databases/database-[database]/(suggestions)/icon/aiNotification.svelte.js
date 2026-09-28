import * as $ from 'svelte/internal/server';
import IconAI from './ai.svelte';

export default function AiNotification($$renderer) {
	IconAI($$renderer, { notification: true });
}