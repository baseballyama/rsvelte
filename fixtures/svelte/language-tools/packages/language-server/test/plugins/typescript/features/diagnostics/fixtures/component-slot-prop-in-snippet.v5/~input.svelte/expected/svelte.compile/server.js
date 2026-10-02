import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';
import ButtonBadge from './ButtonBadge.svelte';

export default function Input($$renderer) {
	{
		function badge($$renderer) {
			ButtonBadge($$renderer, { slot: 'badge' });
		}

		Button($$renderer, { badge, $$slots: { badge: true } });
	}
}