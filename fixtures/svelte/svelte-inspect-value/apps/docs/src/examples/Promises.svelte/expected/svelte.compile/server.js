import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';
import { onMount } from 'svelte';

export default function Promises($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promises = void 0;

		function run(e) {
			if (e) e.stopPropagation();

			// promises = {}
			promises = {
				neverResolve: new Promise(() => {}),
				resolveInAFew: new Promise((resolve) => {
					setTimeout(
						() => {
							resolve('yep');
						},
						2000
					);
				}),

				rejectsInAFew: new Promise((_, reject) => {
					setTimeout(
						() => {
							reject('nope');
						},
						3500
					);
				})
			};
		}

		onMount(run);

		if (promises) {
			$$renderer.push('<!--[0-->');

			{
				function heading($$renderer) {
					$$renderer.push(`<button>rerun</button>`);
				}

				Inspect($$renderer, { values: promises, heading, $$slots: { heading: true } });
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}