import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import Editor from '$doclib/Editor.svelte';
import Inspect from '$lib/Inspect.svelte';
import { getType } from '$lib/util.js';
import examples from './examples.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const exampleKeys = Object.keys(examples);

		function isValidExampleKey(str) {
			return exampleKeys.includes(str);
		}

		let urlName = $.derived(() => {
			const slug = page.params.example?.split('-').join(' ');

			if (slug && isValidExampleKey(slug)) {
				return slug;
			}

			return 'primitives';
		});

		let original = $.derived(() => examples[urlName()]);
		let demoInputValid = true;

		// svelte-ignore state_referenced_locally
		let sourceValue = original();

		let value = { name: 'Dinky Doodlebop', age: 42 };
		let valueType = $.derived(() => getType(value));

		let props = $.derived(() => ({
			value,
			values: ['map', 'set', 'array', 'object'].includes(valueType()) ? value : undefined
		}));

		function reset() {
			sourceValue = original();
			onchange(sourceValue);
			editor?.editor()?.setValue(original());
		}

		let error = void 0;

		function onchange(val) {
			try {
				const func = new Function(val);

				value = func();
				demoInputValid = true;
				error = undefined;
			} catch(e) {
				if (e instanceof Error) {
					error = e.message;
				}

				demoInputValid = false;
			}
		}

		let editor = void 0;

		$$renderer.push(`<h2>Playground</h2> <div class="container svelte-16kiw3y"><div class="flex row align-end justify-between w-max"><button>reset</button> <label>examples `);

		$$renderer.select(
			{
				value: urlName(),
				onchange: (e) => {
					const value = e.currentTarget.value.split(' ').join('-');

					goto(`/playground/${value}`);

					// original = sourceValue
					// onchange(sourceValue)
				}
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(Object.entries(examples));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let [name] = each_array[$$index];

					$$renderer.option({}, name);
				}

				$$renderer.push(`<!--]-->`);
			}
		);

		$$renderer.push(`</label></div> <div class="playground svelte-16kiw3y">`);

		Editor($$renderer, {
			value: sourceValue,
			onchange,
			valid: demoInputValid,
			message: error
		});

		$$renderer.push(`<!----> `);

		Inspect($$renderer, $.spread_props([
			props(),
			{ name: 'demo', expandLevel: 1, heading: 'playground' }
		]));

		$$renderer.push(`<!----></div></div>`);
	});
}