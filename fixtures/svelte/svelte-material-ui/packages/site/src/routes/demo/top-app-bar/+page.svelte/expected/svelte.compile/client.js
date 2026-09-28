import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Variants from './_Variants.svelte';

var root = $.from_html(`<section><h2>Top App Bar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/top-app-bar</pre> <h5>Demos</h5> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('xgb6b0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Top App Bar - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text = $.text('Only the "static" variant works inside containers.');

			$.append($$anchor, text);
		};

		Demo(node, {
			get component() {
				return Static;
			},
			file: 'top-app-bar/_Static.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Top app bars in a container');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_2 = $.text('These are displayed in iframes and the source viewer shows the iframe\n      source.');

			$.append($$anchor, text_2);
		};

		Demo(node_1, {
			get component() {
				return Variants;
			},

			files: [
				'top-app-bar/iframe/standard/+page.svelte',
				'top-app-bar/iframe/fixed/+page.svelte',
				'top-app-bar/iframe/dense/+page.svelte',
				'top-app-bar/iframe/prominent/+page.svelte',
				'top-app-bar/iframe/short/+page.svelte',
				'top-app-bar/iframe/short-closed/+page.svelte'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Page level top app bars');

				$.append($$anchor, text_3);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}