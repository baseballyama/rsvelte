import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Example from '$lib/components/Example.svelte';
import { page } from '$app/state';

var root = $.from_html(`<div class="p-2"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let component = page.params.component;
	let example = page.params.example;
	var div = root();

	$.head('315qpg', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${component ?? ''} - ${example ?? ''} - LayerChart Examples`;
		});
	});

	var node = $.child(div);

	Example(node, {
		get name() {
			return example;
		},

		get component() {
			return component;
		},
		variant: 'basic'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}