import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import Exited from './_Exited.svelte';
import Mini from './_Mini.svelte';
import Extended from './_Extended.svelte';
import NoRipple from './_NoRipple.svelte';
import Link from './_Link.svelte';
import Svg from './_Svg.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section class="svelte-ahwvx4"><h2 class="svelte-ahwvx4">Floating Action Button</h2> <h5 class="svelte-ahwvx4">Installation</h5> <pre class="demo-spaced svelte-ahwvx4">npm i -D @smui/fab</pre> <h5 class="svelte-ahwvx4">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('ahwvx4', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Floating Action Button - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'fab/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return PrimaryColor;
		},
		file: 'fab/_PrimaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary color');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Exited;
		},
		file: 'fab/_Exited.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Exited');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Mini;
		},
		file: 'fab/_Mini.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Mini');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Extended;
		},
		file: 'fab/_Extended.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Extended');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return NoRipple;
		},
		file: 'fab/_NoRipple.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('No Ripple');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Link;
		},
		file: 'fab/_Link.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Link');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return Svg;
		},
		file: 'fab/_Svg.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Svg');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return Colored;
		},
		files: ['fab/_Colored.svelte', 'fab/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}