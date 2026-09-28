import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import container from './container.js';

var root = $.from_html(`<div></div>`);

export default function Top($$anchor, $$props) {
	$.push($$props, true);

	let element;

	onDestroy(() => {
		container.div = element;
	});

	var div = root();

	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.append($$anchor, div);
	$.pop();
}