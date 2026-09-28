import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Variants from './_Variants.svelte';
import Touch from './_Touch.svelte';
import Icons from './_Icons.svelte';
import Link from './_Link.svelte';
import Groups from './_Groups.svelte';
import SplitButtons from './_SplitButtons.svelte';
import Colored from './_Colored.svelte';
import Round from './_Round.svelte';
import Notched from './_Notched.svelte';
import CustomTag from './_CustomTag.svelte';

var root = $.from_html(`<section class="svelte-d3xzgl"><h2 class="svelte-d3xzgl">Button</h2> <h5 class="svelte-d3xzgl">Installation</h5> <pre class="demo-spaced svelte-d3xzgl">npm i -D @smui/button</pre> <h5 class="svelte-d3xzgl">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('d3xzgl', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Button - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'button/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return SecondaryColor;
		},
		file: 'button/_SecondaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Secondary color');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Variants;
		},
		file: 'button/_Variants.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Variants');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Touch;
		},
		file: 'button/_Touch.svelte',
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
			return Icons;
		},
		file: 'button/_Icons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Icons');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Link;
		},
		file: 'button/_Link.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Link');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Groups;
		},
		file: 'button/_Groups.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Button groups');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return SplitButtons;
		},
		file: 'button/_SplitButtons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Split buttons using a button group');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return Colored;
		},
		files: ['button/_Colored.svelte', 'button/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Demo(node_9, {
		get component() {
			return Round;
		},
		files: ['button/_Round.svelte', 'button/_Round.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Creating rounded buttons with Sass mixins');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Demo(node_10, {
		get component() {
			return Notched;
		},
		files: ['button/_Notched.svelte', 'button/_Notched.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Creating notched buttons with Sass');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Demo(node_11, {
		get component() {
			return CustomTag;
		},
		file: 'button/_CustomTag.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Custom HTML tag');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}