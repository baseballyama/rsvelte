import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Permanent from './_Permanent.svelte';
import Dismissible from './_Dismissible.svelte';
import Modal from './_Modal.svelte';

var root = $.from_html(`<section><h2>Drawers</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/drawer</pre> <h5>Demos</h5> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1y2emuw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Drawers - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Permanent;
		},
		file: 'drawer/_Permanent.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('A permanent drawer');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Dismissible;
		},
		file: 'drawer/_Dismissible.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('A dismissible drawer with a header and activated items');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Modal;
		},
		file: 'drawer/_Modal.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('A modal drawer with header, activated items, subheading, icons, list groups');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}