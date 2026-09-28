import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { generateNestedNeedle } from './haystack.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {};
		let maxDepth = 5;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const person = { name: 'Bananaman', age: 36, cool: true, type: 'person' };

		let something = undefined;

		let otherStuff = {
			bananaMan: 'name',
			undefined: 'undefined',
			emptyString: ``,
			arr: [``],
			another_arr: [],
			dingle: new Map(),
			dongle: new Map([[1, 1], [2, 2]]),
			bop: new Set(),
			bap: new Set([1, 2, 3])
		};

		const vals = {
			a: undefined,
			b: null,
			c: true,
			d: 1,
			e: Symbol('something'),
			f: 'string'
		};

		let selectedOption = 'a';

		$$renderer.push(`<button>generate</button> <input type="number"${$.attr('value', maxDepth)} min="1"/> <!---->`);

		{
			Inspect($$renderer, {
				heading: 'find the needle in the haystack',
				name: 'haystack',
				values: value,
				expandLevel: 0,
				showPreview: false,
				showLength: false,
				showTools: true
			});
		}

		$$renderer.push(`<!----> `);

		Inspect($$renderer, {
			values: { person, something, ...otherStuff },
			expandLevel: 0,
			heading: 'person'
		});

		$$renderer.push(`<!----> <label>name <input name="name" type="text"${$.attr('value', person.name)}/></label> <label>age <input name="name" type="number"${$.attr('value', person.age)}/></label> <label>cool <input type="checkbox"${$.attr('checked', person.cool, true)}/></label> <label>something `);

		$$renderer.select(
			{
				value: selectedOption,
				onchange: () => something = vals[selectedOption]
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(vals));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [key, value] = each_array[$$index];

					$$renderer.option({ value: key }, ($$renderer) => {
						$$renderer.push(`${$.escape(String(value))}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`</label>`);
	});
}