import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';
import Code from '../Code.svelte';
import Stack from '../Stack.svelte';
import code from './symbolkeys.txt?raw';

export default function SymbolKeys($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		getContext('toc')?.set('Symbol keys', 'symbols');
		$$renderer.push(`<div class="flex col"><h3 id="symbols">Symbol keys</h3> <p>Object properties where keys are symbols are displayed. these are skipped by <code>JSON.stringify()</code> or <code>Object.keys()</code><br/></p> `);

		Stack($$renderer, {
			children: ($$renderer) => {
				Code($$renderer, { code, language: 'javascript' });
				$$renderer.push(`<!----> `);

				Inspect($$renderer, {
					value: {
						stringKey: 'string value',
						anotherKey: 2,
						[Symbol('i am key')]: 'my key is a symbol'
					},
					name: 'objectWithSymbolKey',
					style: 'max-width: 400px;',
					expandAll: true
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}