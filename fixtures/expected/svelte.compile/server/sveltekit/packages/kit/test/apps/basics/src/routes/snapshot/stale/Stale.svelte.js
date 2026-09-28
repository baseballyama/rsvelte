import * as $ from 'svelte/internal/server';
import { snapshot } from '$app/navigation';

export default function Stale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = '';

		snapshot({
			id: 'stale-check',
			capture: () => value,
			restore: (v) => value = v
		});

		$$renderer.push(`<input data-testid="stale-input"${$.attr('value', value)}/>`);
	});
}