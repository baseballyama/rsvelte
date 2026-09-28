import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import FourByFive from './_FourByFive.svelte';
import Masonry from './_Masonry.svelte';
import EnforceAspectRatio from './_EnforceAspectRatio.svelte';

var root = $.from_html(`Using a <code>div</code> instead of an <code>img</code> to enforce aspect ratio`, 1);
var root_1 = $.from_html(`<section><h2>Image Lists</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/image-list</pre> <h5>Demos</h5> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root_1();

	$.head('duub1t', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Image Lists - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		files: ['image-list/_Simple.svelte', 'image-list/_Simple.scss']
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return FourByFive;
		},

		files: [
			'image-list/_FourByFive.svelte',
			'image-list/_FourByFive.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('4x5 aspect ratio, with text protection');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Masonry;
		},
		files: ['image-list/_Masonry.svelte', 'image-list/_Masonry.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Masonry, with rounded shapes');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return EnforceAspectRatio;
		},

		files: [
			'image-list/_EnforceAspectRatio.svelte',
			'image-list/_EnforceAspectRatio.scss'
		],

		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next(4);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}