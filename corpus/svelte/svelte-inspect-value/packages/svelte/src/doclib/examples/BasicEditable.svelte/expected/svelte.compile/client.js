import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { GLOBAL_OPTIONS_CONTEXT } from '$lib/options.svelte.js';
import { getContext } from 'svelte';
import ToggleButton from '../../routes/(app)/ToggleButton.svelte';
import Editor from '../Editor.svelte';
import Stack from '../Stack.svelte';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<div class="flex col svelte-1koj03p"><h3 id="json">JSON</h3> <p><code>Inspect</code> works well for basic object and array-values aka "JSON".<br/> If needed, strings that start with <code>'['</code> or <code></code> can be parsed. Try
    it: <span style="margin-left: 0.5em;"><!></span></p> <button>reset</button> <!></div>`);

export default function BasicEditable($$anchor, $$props) {
	$.push($$props, true);

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

	let demoInputValid = $.state(true);
	let sourceValue = $.state(original);
	let value = $.state($.proxy(eval(original)));

	function reset() {
		$.set(sourceValue, original);
		$.set(value, eval($.get(sourceValue)), true);
		$.get(editor)?.editor()?.setValue(original);
	}

	let error = $.state(void 0);

	function onchange(val) {
		try {
			const obj = eval(val);

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

	getContext('toc')?.set('JSON', 'json');

	const globalInspectOptions = getContext(GLOBAL_OPTIONS_CONTEXT)();
	let editor = $.state(void 0);
	const setOption = getContext('set-global-option');
	var div = root_1();
	var p = $.sibling($.child(div), 2);
	var code = $.sibling($.child(p), 6);

	code.textContent = '\'{\'';

	var span = $.sibling(code, 2);
	var node = $.child(span);
	var bind_get = () => globalInspectOptions.parseJson;
	var bind_set = (val) => setOption('parseJson', val);

	ToggleButton(node, {
		duration: 0,
		get checked() {
			return bind_get();
		},

		set checked($$value) {
			bind_set($$value);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('parse json');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(span);
	$.reset(p);

	var button = $.sibling(p, 2);
	var node_1 = $.sibling(button, 2);

	Stack(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			$.bind_this(
				Editor(node_2, {
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

			var node_3 = $.sibling(node_2, 2);

			Inspect(node_3, {
				get value() {
					return $.get(value);
				},
				name: 'demo'
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.delegated('click', button, () => reset());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);