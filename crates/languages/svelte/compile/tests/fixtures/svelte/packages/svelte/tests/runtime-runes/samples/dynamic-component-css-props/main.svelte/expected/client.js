import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Main($$anchor) {
	let Comp = Component;
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--color': 'red' }));

		$.component(node.lastChild, () => Comp, ($$anchor, $$component) => {
			$$component($$anchor, {});
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}