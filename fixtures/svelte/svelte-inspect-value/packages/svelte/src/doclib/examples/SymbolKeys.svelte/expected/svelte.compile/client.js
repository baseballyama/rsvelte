import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import code from './symbolkeys.txt?raw';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex col"><h3 id="symbols">Symbol keys</h3> <p>Object properties where keys are symbols are displayed. these are skipped by <code>JSON.stringify()</code> or <code>Object.keys()</code><br/></p> <!></div>`);

export default function SymbolKeys($$anchor, $$props) {
	$.push($$props, true);
	getContext('toc')?.set('Symbol keys', 'symbols');

	var div = root_1();
	var node = $.sibling($.child(div), 4);

	Stack(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Code(node_1, {
				get code() {
					return code;
				},
				language: 'javascript'
			});

			var node_2 = $.sibling(node_1, 2);

			Inspect(node_2, {
				value: {
					stringKey: 'string value',
					anotherKey: 2,
					[Symbol('i am key')]: 'my key is a symbol'
				},
				name: 'objectWithSymbolKey',
				style: 'max-width: 400px;',
				expandAll: true
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}