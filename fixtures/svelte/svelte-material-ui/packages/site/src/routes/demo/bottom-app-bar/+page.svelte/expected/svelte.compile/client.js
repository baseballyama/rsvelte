import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Variants from './_Variants.svelte';
import Fab from './_Fab.svelte';
import InsetFab from './_InsetFab.svelte';
import Snackbar from './_Snackbar.svelte';

var root = $.from_html(`<section><h2>Bottom App Bar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui-extra/bottom-app-bar</pre> <h5>Use</h5> <p>Please note that the Material spec states "Bottom app bars should be used
    for mobile devices only".</p> <h5>Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1mt8o9o', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Bottom App Bar - SMUI';
		});
	});

	var node = $.sibling($.child(section), 12);

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
			file: 'bottom-app-bar/_Static.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Bottom app bars in a container');

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
				'bottom-app-bar/iframe/standard/+page.svelte',
				'bottom-app-bar/iframe/fixed/+page.svelte'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Page level bottom app bars');

				$.append($$anchor, text_3);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Fab;
		},
		file: 'bottom-app-bar/_Fab.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('FABs');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_5 = $.text('These are displayed in iframes so that content will appear behind the\n      inset.');

			$.append($$anchor, text_5);
		};

		Demo(node_3, {
			get component() {
				return InsetFab;
			},

			files: [
				'bottom-app-bar/iframe/inset-fab/+page.svelte',
				'bottom-app-bar/iframe/inset-fab-right/+page.svelte'
			],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Inset FAB');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_7 = $.text('The snackbar is positioned above the bottom app bar. Note: to follow\n      scrolling adjustments with the "standard" variant, this requires the\n      AutoAdjust component.');

			$.append($$anchor, text_7);
		};

		Demo(node_4, {
			get component() {
				return Snackbar;
			},
			files: ['bottom-app-bar/iframe/snackbar/+page.svelte'],
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('Snackbar positioning');

				$.append($$anchor, text_8);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}