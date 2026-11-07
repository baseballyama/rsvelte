import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { onMount, onDestroy } from 'svelte';

export default function CustomJs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let script;

		onMount(async () => {
			try {
				const response = await fetch(`${base}/_api/custom_js`);
				const data = await response.json();

				if (response.ok) {
					script = document.createElement('script');

					const blob = new Blob([data], { type: 'application/javascript' });

					script.src = URL.createObjectURL(blob);
					document.head.appendChild(script);
				} else {
					throw new Error(data);
				}
			} catch(error) {
				console.error('Custom JavaScript', error);
			}
		});

		onDestroy(() => {
			if (script) {
				document.head.removeChild(script);
			}
		});
	});
}