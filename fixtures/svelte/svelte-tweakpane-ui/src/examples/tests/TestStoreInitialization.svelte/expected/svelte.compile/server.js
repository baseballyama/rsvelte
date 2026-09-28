import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';
import { writable } from 'svelte/store';
import { Slider } from '$lib';

export default function TestStoreInitialization($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Via https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/15
		const bear = writable({ apples: 100, name: 'Someone' });

		const bear2 = writable({ apples: 100, name: 'Someone' });

		onMount(async () => {
			// No tick
			$.store_mutate($$store_subs ??= {}, '$bear2', bear2, $.store_get($$store_subs ??= {}, '$bear2', bear2).apples = 60);

			// With Tick
			await tick();

			$.store_mutate($$store_subs ??= {}, '$bear', bear, $.store_get($$store_subs ??= {}, '$bear', bear).apples = 60);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>With tick, works in Svelte 4</h1> <p>Native input</p> <input${$.attr('max', 100)}${$.attr('min', 0)}${$.attr('step', 1)} type="range"${$.attr('value', $.store_get($$store_subs ??= {}, '$bear', bear).apples)}/> <p>Svelte Tweakpane UI</p> `);

			Slider($$renderer, {
				max: 100,
				min: 0,
				step: 1,
				get value() {
					return $.store_get($$store_subs ??= {}, '$bear', bear).apples;
				},

				set value($$value) {
					$.store_mutate($$store_subs ??= {}, '$bear', bear, $.store_get($$store_subs ??= {}, '$bear', bear).apples = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <h1>Without tick, works in Svelte 5</h1> <p>Native input</p> <input${$.attr('max', 100)}${$.attr('min', 0)}${$.attr('step', 1)} type="range"${$.attr('value', $.store_get($$store_subs ??= {}, '$bear2', bear2).apples)}/> <p>Svelte Tweakpane UI</p> `);

			Slider($$renderer, {
				max: 100,
				min: 0,
				step: 1,
				get value() {
					return $.store_get($$store_subs ??= {}, '$bear2', bear2).apples;
				},

				set value($$value) {
					$.store_mutate($$store_subs ??= {}, '$bear2', bear2, $.store_get($$store_subs ??= {}, '$bear2', bear2).apples = $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}