import * as $ from 'svelte/internal/server';
import _Inspect from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import rawCode from './iterators.txt?raw';

export default function Iterators($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;

		function* fibonacci() {
			let current = 1;
			let next = 1;

			while (true) {
				yield current;
				[current, next] = [next, current + next];
			}
		}

		async function* suspensefulFibonacci() {
			let current = 1;
			let next = 1;

			while (true) {
				await new Promise((resolve) => {
					setTimeout(
						() => {
							resolve(undefined);
						},
						Math.ceil(Math.random() * 1000)
					);
				});

				yield current;
				[current, next] = [next, current + next];
			}
		}

		let iterators = {
			fibonacci: fibonacci(),
			suspensefulFibonacci: suspensefulFibonacci(),
			array: [1, 2, 3, 4].values(),
			set: new Set([12, 34, 45]).values(),
			map: new Map([
				[0, 0],
				[{ id: 123 }, 1],
				[[1, 2, 3], 2],
				[Symbol('key'), 'value'],
				[
					Promise.resolve('foo'),
					{
						get something() {
							return 'something';
						}
					}
				]
			]).entries(),
			stringIterator: ('abdcdefghijklmnopqrstuvwxyzæøå')[Symbol.iterator]()
		};

		getContext('toc')?.set('Iterators & Generators', 'iterators');

		const Inspect = _Inspect.Values.withOptions(() => ({ expandLevel: 0, previewDepth: 20, previewEntries: Infinity }));

		$$renderer.push(`<div class="flex col"><h3 id="iterators">Iterators &amp; Generators</h3> <p>Iterators have to be iterated manually since doing so directly affects the source iterator.</p> `);

		Stack($$renderer, {
			children: ($$renderer) => {
				Code($$renderer, {
					code: rawCode,
					children: ($$renderer) => {
						$$renderer.push(`${$.html(code)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div style="flex-basis: 50%">`);
				Inspect($$renderer, $.spread_props([iterators]));
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}