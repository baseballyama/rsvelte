import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Mount from './Mount.svelte';
import { onMount, mount } from 'svelte';

var root = $.from_html(`<div id="target"></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		// @ts-ignore
		mount(Mount, { target: document.querySelector('#target') });
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}