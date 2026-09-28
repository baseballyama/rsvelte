import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Static from './_Static.svelte';
import Anchored from './_Anchored.svelte';
import ManualAnchor from './_ManualAnchor.svelte';

var root = $.from_html(`<section><h2>Menu Surface</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/menu-surface</pre> <h5>Demos</h5> <!> <!> <!> <!> <div style="padding-top: 200px;">Long div for scrolling...</div></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('c7e1ao', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Menu Surface - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'menu-surface/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Static;
		},
		file: 'menu-surface/_Static.svelte'
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Anchored;
		},
		file: 'menu-surface/_Anchored.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Anchored automatically, corner set to bottom-left');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return ManualAnchor;
		},

		files: [
			'menu-surface/_ManualAnchor.svelte',
			'menu-surface/_ManualAnchor.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Anchored manually, origin corner flipped horizontally');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(section);
	$.append($$anchor, section);
}