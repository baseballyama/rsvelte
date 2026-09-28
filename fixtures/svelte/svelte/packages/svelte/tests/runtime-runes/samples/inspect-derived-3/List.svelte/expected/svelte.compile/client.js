import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

var root = $.from_html(`<div class="list"><!></div>`);

export default function List($$anchor, $$props) {
	$.push($$props, true);

	let listContext = $.proxy({ selectedValue: $$props.selectedValue });

	$.user_effect(() => {
		listContext.selectedValue = $$props.selectedValue;
	});

	setContext('list', listContext);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}