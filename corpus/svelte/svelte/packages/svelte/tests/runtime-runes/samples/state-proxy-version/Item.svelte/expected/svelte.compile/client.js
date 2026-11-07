import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<div>Item</div>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let context = getContext('container');

	$.user_effect(() => {
		context.register('test');

		return () => context.unregister('test');
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}