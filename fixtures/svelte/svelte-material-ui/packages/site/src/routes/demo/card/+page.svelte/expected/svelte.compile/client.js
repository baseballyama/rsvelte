import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Actions from './_Actions.svelte';
import Media from './_Media.svelte';
import List from './_List.svelte';
import Complex from './_Complex.svelte';

var root = $.from_html(`<section class="svelte-1k2a7ib"><h2 class="svelte-1k2a7ib">Cards</h2> <h5 class="svelte-1k2a7ib">Installation</h5> <pre class="demo-spaced svelte-1k2a7ib">npm i -D @smui/card</pre> <h5 class="svelte-1k2a7ib">Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1k2a7ib', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Cards - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'card/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Actions;
		},
		file: 'card/_Actions.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('With Actions');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Media;
		},
		file: 'card/_Media.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('With Media');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return List;
		},
		file: 'card/_List.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('With a List');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Complex;
		},
		file: 'card/_Complex.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Complex');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}