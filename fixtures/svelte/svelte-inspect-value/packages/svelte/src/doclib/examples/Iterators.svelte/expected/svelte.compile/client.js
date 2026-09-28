import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import _Inspect from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import rawCode from './iterators.txt?raw';

var root = $.from_html(`<!> <div style="flex-basis: 50%"><!></div>`, 1);
var root_1 = $.from_html(`<div class="flex col"><h3 id="iterators">Iterators & Generators</h3> <p>Iterators have to be iterated manually since doing so directly affects the source iterator.</p> <!></div>`);

export default function Iterators($$anchor, $$props) {
	$.push($$props, true);

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

	let iterators = $.proxy({
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
	});

	getContext('toc')?.set('Iterators & Generators', 'iterators');

	const Inspect = _Inspect.Values.withOptions(() => ({ expandLevel: 0, previewDepth: 20, previewEntries: Infinity }));
	var div = root_1();
	var node = $.sibling($.child(div), 4);

	Stack(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Code(node_1, {
				get code() {
					return rawCode;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.html(node_2, () => $$props.code);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_1, 2);
			var node_3 = $.child(div_1);

			Inspect(node_3, $.spread_props(() => iterators));
			$.reset(div_1);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}