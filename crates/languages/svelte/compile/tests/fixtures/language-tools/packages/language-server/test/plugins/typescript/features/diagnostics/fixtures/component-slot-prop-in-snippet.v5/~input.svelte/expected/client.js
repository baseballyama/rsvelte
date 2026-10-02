import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';
import ButtonBadge from './ButtonBadge.svelte';

export default function Input($$anchor) {
	{
		const badge = ($$anchor) => {
			ButtonBadge($$anchor, { slot: 'badge' });
		};

		Button($$anchor, { badge, $$slots: { badge: true } });
	}
}