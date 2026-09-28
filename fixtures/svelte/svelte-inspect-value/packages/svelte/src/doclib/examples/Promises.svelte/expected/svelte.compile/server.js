import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext, onMount } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import promiseCode from './promises.txt?raw';

export default function Promises($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;
		let promises = void 0;

		function run() {
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
		getContext('toc')?.set('Promises', 'promises');
		$$renderer.push(`<div class="flex col"><h3 id="promises">Promises</h3> <button>rerun</button> `);

		Stack($$renderer, {
			children: ($$renderer) => {
				Code($$renderer, {
					style: 'flex-basis: 50%',
					code: promiseCode,
					children: ($$renderer) => {
						$$renderer.push(`${$.html(code)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (promises) {
					$$renderer.push('<!--[0-->');
					Inspect($$renderer, { values: promises });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}