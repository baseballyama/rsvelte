import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="flex col"><h3 id="multiline">Multi-line strings</h3> <p>Expandable view for multi-line strings</p> <!></div>`);

export default function MultiLineStrings($$anchor, $$props) {
	$.push($$props, true);
	getContext('toc')?.set('Multi-line strings', 'multiline');

	var div = root();
	var node = $.sibling($.child(div), 4);

	$.component(node, () => Inspect.Values, ($$anchor, Inspect_Values) => {
		Inspect_Values($$anchor, {
			normal: 'normal boring string',
			multiLine: 'cool\n\tmulti-line\n\t\t\trender 😎'
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}