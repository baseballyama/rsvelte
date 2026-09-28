import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Unbounded from './_Unbounded.svelte';
import KeyboardActivation from './_KeyboardActivation.svelte';

var root = $.from_html(`<section><h2>Ripple</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/ripple</pre> <h5>Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('ue57c3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Ripple - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'ripple/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return PrimaryColor;
		},
		file: 'ripple/_PrimaryColor.svelte'
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return SecondaryColor;
		},
		file: 'ripple/_SecondaryColor.svelte'
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Unbounded;
		},
		file: 'ripple/_Unbounded.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Unbounded');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return KeyboardActivation;
		},
		file: 'ripple/_KeyboardActivation.svelte'
	});

	$.reset(section);
	$.append($$anchor, section);
}