import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';
import C from './C.svelte';

var root = $.from_html(`<div><!></div>`);

export default function B($$anchor, $$props) {
	$.push($$props, true);

	let yes = 1;

	onDestroy(() => destroyed.push('B'));

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			C($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (yes) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}