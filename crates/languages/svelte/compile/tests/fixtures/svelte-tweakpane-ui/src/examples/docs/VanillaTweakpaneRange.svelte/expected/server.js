import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Pane } from 'tweakpane';

export default function VanillaTweakpaneRange($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let params = { speed: 50 };
		let container;

		onMount(() => {
			const pane = new Pane({ container });

			pane.addBinding(params, 'speed', { min: 0, max: 100 });

			pane.on('change', () => {
				// Trigger Svelte reactivity
				params = params;
			});

			return () => {
				pane.dispose();
			};
		});

		$$renderer.push(`<div></div> <pre>${$.escape(params.speed)}
</pre>`);
	});
}