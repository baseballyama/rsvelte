import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data = 123 } = $$props;

		onDestroy(() => {
			data;
		});

		$$renderer.push(`<!---->${$.escape(data ? '' : null)}`);
	});
}