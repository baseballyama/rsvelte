import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Icons from './_Icons.svelte';
import KeyedIconsAboveRestrictedIndicatorsFadeTransition from './_KeyedIconsAboveRestrictedIndicatorsFadeTransition.svelte';
import ScrollingNoInitialActive from './_ScrollingNoInitialActive.svelte';
import MinWidth from './_MinWidth.svelte';
import IconIndicators from './_IconIndicators.svelte';
import HrefAnchors from './_HrefAnchors.svelte';

var root = $.from_html(`<section class="svelte-1lmrayd"><h2>Tabs</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/tab @smui/tab-bar</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1lmrayd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tabs - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'tabs/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Icons;
		},
		file: 'tabs/_Icons.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Tabs with icons next to labels');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return KeyedIconsAboveRestrictedIndicatorsFadeTransition;
		},
		file: 'tabs/_KeyedIconsAboveRestrictedIndicatorsFadeTransition.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Keyed tabs with icons above labels, indicators restricted to content, and\n    fade transition');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return ScrollingNoInitialActive;
		},
		file: 'tabs/_ScrollingNoInitialActive.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Scrolling tabs with no initial active tab');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return MinWidth;
		},
		file: 'tabs/_MinWidth.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Min width tabs');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return IconIndicators;
		},
		file: 'tabs/_IconIndicators.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Icon indicators');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_5 = $.text('But they don\'t activate through keyboard arrow keys. They need to be\n      activated with the enter key.');

			$.append($$anchor, text_5);
		};

		Demo(node_6, {
			get component() {
				return HrefAnchors;
			},
			file: 'tabs/_HrefAnchors.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Tabs with href attributes render as anchor elements');

				$.append($$anchor, text_6);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}