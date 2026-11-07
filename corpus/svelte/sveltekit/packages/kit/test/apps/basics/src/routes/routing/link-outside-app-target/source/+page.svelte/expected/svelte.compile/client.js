import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { increment, count } from '../state.js';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	onMount(increment);

	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `source: ${count ?? ''}`));
	$.append($$anchor, h1);
	$.pop();
}