import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import NonInteractive from './_NonInteractive.svelte';
import Choice from './_Choice.svelte';
import Filter from './_Filter.svelte';
import FilterIcons from './_FilterIcons.svelte';
import Input from './_Input.svelte';
import Keyed from './_Keyed.svelte';

var root = $.from_html(`<section><h2>Chips</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/chips</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('zt8t8a', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Chips - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'chips/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return NonInteractive;
		},
		file: 'chips/_NonInteractive.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Non-interactive chips');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Choice;
		},
		file: 'chips/_Choice.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Choice chips');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Filter;
		},
		file: 'chips/_Filter.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Filter chips with increased touch target');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return FilterIcons;
		},
		file: 'chips/_FilterIcons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('The same, but with leading icons');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Input;
		},
		file: 'chips/_Input.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Input chips');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Keyed;
		},
		file: 'chips/_Keyed.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Keyed filter input chips');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}