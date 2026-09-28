import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Buffered from './_Buffered.svelte';
import Indeterminate from './_Indeterminate.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section><h2>Linear Progress</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/linear-progress</pre> <h5>Demos</h5> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1xao8w6', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Linear Progress - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'linear-progress/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Buffered;
		},
		file: 'linear-progress/_Buffered.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Buffered');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Indeterminate;
		},
		file: 'linear-progress/_Indeterminate.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Indeterminate');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Colored;
		},

		files: [
			'linear-progress/_Colored.svelte',
			'linear-progress/_Colored.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}