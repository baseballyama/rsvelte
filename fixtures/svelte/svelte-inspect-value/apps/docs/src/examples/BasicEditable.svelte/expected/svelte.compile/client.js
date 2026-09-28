import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';
import Editor from '@components/editor/CodeEditor.svelte';

var root = $.from_html(`<div class="editor svelte-1gwhju2"><button class="reset-button svelte-1gwhju2" style="float: right;">reset</button> <!></div> <!>`, 1);

export default function BasicEditable($$anchor) {
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

	let demoInputValid = $.state(true);
	let sourceValue = $.state(original);
	let value = $.state($.proxy(evaluate(original)));

	function reset() {
		$.set(sourceValue, original);
		$.set(value, evaluate($.get(sourceValue)), true);
		$.get(editor)?.setValue(original);
	}

	let error = $.state(void 0);

	function onchange(val) {
		try {
			const obj = evaluate(val);

			$.set(value, obj, true);
			$.set(demoInputValid, true);
			$.set(error, undefined);
		} catch(e) {
			if (e instanceof Error) {
				$.set(error, e.message, true);
			}

			$.set(demoInputValid, false);
		}
	}

	function evaluate(val) {
		return eval(`(${val})`);
	}

	let editor = $.state(void 0);
	var fragment = root();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var node = $.sibling(button, 2);

	$.bind_this(
		Editor(node, {
			get value() {
				return $.get(sourceValue);
			},
			onchange,
			get valid() {
				return $.get(demoInputValid);
			},

			get message() {
				return $.get(error);
			}
		}),
		($$value) => $.set(editor, $$value, true),
		() => $.get(editor)
	);

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Inspect(node_1, {
		get value() {
			return $.get(value);
		},
		name: 'demo'
	});

	$.delegated('click', button, () => reset());
	$.append($$anchor, fragment);
}

$.delegate(['click']);