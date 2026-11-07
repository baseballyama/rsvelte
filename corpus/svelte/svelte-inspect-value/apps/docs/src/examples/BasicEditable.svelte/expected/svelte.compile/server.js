import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';
import Editor from '@components/editor/CodeEditor.svelte';

export default function BasicEditable($$renderer) {
	const original = `{ // edit me!
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
  jsonString: '[{ "message": "i can be parsed" }]'
}`;

	let demoInputValid = true;
	let sourceValue = original;
	let value = evaluate(original);

	function reset() {
		sourceValue = original;
		value = evaluate(sourceValue);
		editor?.setValue(original);
	}

	let error = void 0;

	function onchange(val) {
		try {
			const obj = evaluate(val);

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

	function evaluate(val) {
		return eval(`(${val})`);
	}

	let editor = void 0;

	$$renderer.push(`<div class="editor svelte-1gwhju2"><button class="reset-button svelte-1gwhju2" style="float: right;">reset</button> `);

	Editor($$renderer, {
		value: sourceValue,
		onchange,
		valid: demoInputValid,
		message: error
	});

	$$renderer.push(`<!----></div> `);
	Inspect($$renderer, { value, name: 'demo' });
	$$renderer.push(`<!---->`);
}