import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Toggle from './_Toggle.svelte';
import Svgs from './_Svgs.svelte';
import Touch from './_Touch.svelte';
import Sizes from './_Sizes.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section><h2>Icon Button</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/icon-button</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('kfx2iv', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Icon Button - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'icon-button/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Toggle;
		},
		file: 'icon-button/_Toggle.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle buttons');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Svgs;
		},
		file: 'icon-button/_Svgs.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Using SVGs');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Touch;
		},
		file: 'icon-button/_Touch.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Increased touch target');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Sizes;
		},
		file: 'icon-button/_Sizes.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Different sizes');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Colored;
		},
		files: ['icon-button/_Colored.svelte', 'icon-button/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}