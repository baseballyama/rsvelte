import 'svelte/internal/disclose-version';

import { browser } from './environment.js';

import * as $ from 'svelte/internal/client';

import { onMount } from 'svelte';

export const label = browser ? 'browser' : 'server';

var root = $.from_html(`<p> </p>`);

export default function Module_imports($$anchor, $$props) {
	$.push($$props, true);
	let count = $.state(0);
	onMount(() => $.update(count));
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${label} ${$.get(count) ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}
