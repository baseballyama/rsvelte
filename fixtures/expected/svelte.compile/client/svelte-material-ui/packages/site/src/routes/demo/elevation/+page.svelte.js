import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Elevation from './_Elevation.svelte';
import TransitionsAndColor from './_TransitionsAndColor.svelte';

var root = $.from_html(`<section><h2>Elevation</h2> <p>Part of <code>@smui/common</code>.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/common</pre> <h5>Demos</h5> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('pqw54u', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Elevation - SMUI';
		});
	});

	var node = $.sibling($.child(section), 10);

	Demo(node, {
		get component() {
			return Elevation;
		},
		files: ['elevation/_Elevation.svelte', 'elevation/_Elevation.scss']
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return TransitionsAndColor;
		},

		files: [
			'elevation/_TransitionsAndColor.svelte',
			'elevation/_TransitionsAndColor.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Transitions and color');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}