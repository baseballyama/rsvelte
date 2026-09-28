import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Touch from './_Touch.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section><h2>Radio</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/radio</pre> <h5>Demos</h5> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('z2pk9e', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Radio - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'radio/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Touch;
		},
		file: 'radio/_Touch.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Increased touch target');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Colored;
		},
		files: ['radio/_Colored.svelte', 'radio/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}