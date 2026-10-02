import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Style_ptops_test_input($$anchor) {
	let color = 'red';
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--b': color, '--a': color }));
		MyComponent(node.lastChild, {});
		$.reset(node);
	}

	$.append($$anchor, fragment);
}