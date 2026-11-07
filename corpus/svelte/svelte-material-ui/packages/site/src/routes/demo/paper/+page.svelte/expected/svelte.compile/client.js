import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Square from './_Square.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Colored from './_Colored.svelte';
import ElevationTransition from './_ElevationTransition.svelte';

var root = $.from_html(`<section class="svelte-x2s8yd"><h2 class="svelte-x2s8yd">Paper</h2> <h5 class="svelte-x2s8yd">Installation</h5> <pre class="demo-spaced svelte-x2s8yd">npm i -D @smui/paper</pre> <h5 class="svelte-x2s8yd">Demos</h5> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('x2s8yd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Paper - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'paper/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Square;
		},
		file: 'paper/_Square.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Square paper');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return PrimaryColor;
		},
		file: 'paper/_PrimaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Primary color');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return SecondaryColor;
		},
		file: 'paper/_SecondaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Secondary color');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Colored;
		},
		files: ['paper/_Colored.svelte', 'paper/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return ElevationTransition;
		},
		file: 'paper/_ElevationTransition.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Elevation and transition');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}