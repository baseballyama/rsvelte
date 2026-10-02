import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import SingleSelection from './_SingleSelection.svelte';
import GroupSelection from './_GroupSelection.svelte';
import ManualSelection from './_ManualSelection.svelte';
import IconsKeys from './_IconsKeys.svelte';
import Touch from './_Touch.svelte';

var root = $.from_html(`<section><h2>Segmented Button</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/segmented-button</pre> <h5>Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('h4daaa', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Segmented Button - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return SingleSelection;
		},
		file: 'segmented-button/_SingleSelection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Single Selection');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return GroupSelection;
		},
		file: 'segmented-button/_GroupSelection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Group Selection');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return ManualSelection;
		},
		file: 'segmented-button/_ManualSelection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Manual Selection');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return IconsKeys;
		},
		file: 'segmented-button/_IconsKeys.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Icons and Keyed Segments');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Touch;
		},
		file: 'segmented-button/_Touch.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Increased Touch Target');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}