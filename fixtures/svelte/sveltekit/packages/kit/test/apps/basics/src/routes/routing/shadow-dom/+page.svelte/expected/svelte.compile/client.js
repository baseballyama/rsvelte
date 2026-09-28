import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div><div id="clickme">Hello world</div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/** @type {HTMLDivElement} */
	let elem;

	onMount(() => {
		const shadow = elem.attachShadow({ mode: 'open' });
		const anchor = document.createElement('a');

		anchor.href = '/routing/a';
		anchor.innerHTML = '<slot>';
		shadow.appendChild(anchor);
	});

	var div = root();

	$.bind_this(div, ($$value) => elem = $$value, () => elem);
	$.append($$anchor, div);
	$.pop();
}