import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Touch from './_Touch.svelte';
import Group from './_Group.svelte';
import Indeterminate from './_Indeterminate.svelte';
import Colored from './_Colored.svelte';

var root = $.from_html(`<section><h2>Checkbox</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/checkbox</pre> <h5>Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1sp5vro', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Checkbox - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'checkbox/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Touch;
		},
		file: 'checkbox/_Touch.svelte',
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
			return Group;
		},
		file: 'checkbox/_Group.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Group checkbox');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Indeterminate;
		},
		file: 'checkbox/_Indeterminate.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Indeterminate');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Colored;
		},
		files: ['checkbox/_Colored.svelte', 'checkbox/_Colored.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Colored (using Sass mixins)');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}