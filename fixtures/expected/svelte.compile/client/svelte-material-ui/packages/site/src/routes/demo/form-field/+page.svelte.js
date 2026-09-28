import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Checkbox from './_Checkbox.svelte';
import EndAlignment from './_EndAlignment.svelte';
import Radio from './_Radio.svelte';
import Switch from './_Switch.svelte';

var root = $.from_html(`<section><h2>Form Fields</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/form-field</pre> <h5>Demos</h5> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('12gabdi', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Form Field - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Checkbox;
		},
		file: 'form-field/_Checkbox.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Checkbox');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return EndAlignment;
		},
		file: 'form-field/_EndAlignment.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('End alignment');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Radio;
		},
		file: 'form-field/_Radio.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Radio button');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Switch;
		},
		file: 'form-field/_Switch.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Switch');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}