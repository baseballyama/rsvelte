import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { GLOBAL_OPTIONS_CONTEXT } from '$lib/options.svelte.js';
import { getContext } from 'svelte';
import ToggleButton from '../../routes/(app)/ToggleButton.svelte';
import Editor from '../Editor.svelte';
import Stack from '../Stack.svelte';

export default function BasicEditable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const original = `({ // edit me!
  id: undefined,
  firstName: 'Bob',
  lastName: 'Alice',
  email: 'bob@alice.lol',
  introduction: \`The name is Alice.\\n\\n\\t\\tBob Alice.\`,
  birthDate: new Date('1970-01-01'),
  website: new URL('https://alice.bob/?ref=abcd#about'),
  age: -42,
  emailVerified: true,
  interests: ['radio', 'tv', 'internet', 'kayaks', null],
  jsonString: '[{ "message": "i can be parsed if desired" }]'
});`;

		let demoInputValid = true;
		let sourceValue = original;
		let value = eval(original);

		function reset() {
			sourceValue = original;
			value = eval(sourceValue);
			editor?.editor()?.setValue(original);
		}

		let error = void 0;

		function onchange(val) {
			try {
				const obj = eval(val);

				value = obj;
				demoInputValid = true;
				error = undefined;
			} catch(e) {
				if (e instanceof Error) {
					error = e.message;
				}

				demoInputValid = false;
			}
		}

		getContext('toc')?.set('JSON', 'json');

		const globalInspectOptions = getContext(GLOBAL_OPTIONS_CONTEXT)();
		let editor = void 0;
		const setOption = getContext('set-global-option');
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => globalInspectOptions.parseJson;
			var bind_set = (val) => setOption('parseJson', val);

			$$renderer.push(`<div class="flex col svelte-1koj03p"><h3 id="json">JSON</h3> <p><code>Inspect</code> works well for basic object and array-values aka "JSON".<br/> If needed, strings that start with <code>'['</code> or <code>'{'</code> can be parsed. Try
    it: <span style="margin-left: 0.5em;">`);

			ToggleButton($$renderer, {
				duration: 0,
				get checked() {
					return bind_get();
				},

				set checked($$value) {
					bind_set($$value);
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->parse json`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></span></p> <button>reset</button> `);

			Stack($$renderer, {
				children: ($$renderer) => {
					Editor($$renderer, {
						value: sourceValue,
						onchange,
						valid: demoInputValid,
						message: error
					});

					$$renderer.push(`<!----> `);
					Inspect($$renderer, { value, name: 'demo' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}