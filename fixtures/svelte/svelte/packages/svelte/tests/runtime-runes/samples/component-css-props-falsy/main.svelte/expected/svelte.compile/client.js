import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--zero': 0, '--one': 1, '--empty': '', '--nullish': null }));
		Component(node.lastChild, {});
		$.reset(node);
	}

	$.append($$anchor, fragment);
}