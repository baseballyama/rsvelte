import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Indeterminate from './_Indeterminate.svelte';
import FourColor from './_FourColor.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section><h2>Circular Progress</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/circular-progress</pre> <h5>Demos</h5> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1vpx636', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Circular Progress - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'circular-progress/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Indeterminate;
		},
		file: 'circular-progress/_Indeterminate.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Indeterminate');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return FourColor;
		},

		files: [
			'circular-progress/_FourColor.svelte',
			'circular-progress/_FourColor.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Four Color');

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
			'circular-progress/_Colored.svelte',
			'circular-progress/_Colored.scss'
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