import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Static from './_Static.svelte';
import Anchored from './_Anchored.svelte';
import TwoLineManunalAnchor from './_TwoLineManunalAnchor.svelte';
import SelectionGroup from './_SelectionGroup.svelte';
import Portal from './_Portal.svelte';

var root = $.from_html(`<section><h2>Menu</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/menu</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <div style="padding-top: 200px;">Long div for scrolling...</div></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('63ewvm', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Menu - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Static;
		},
		file: 'menu/_Static.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Anchored;
		},
		file: 'menu/_Anchored.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Anchored automatically');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return TwoLineManunalAnchor;
		},
		file: 'menu/_TwoLineManunalAnchor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Two line, anchored manually, corner set to bottom-left');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return SelectionGroup;
		},
		file: 'menu/_SelectionGroup.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Selection groups');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_3 = $.text('Using a svelte-portal to show a menu in a place where it normally couldn\'t\n      go (due to DOM restrictions, hidden overflow, etc.).');

			$.append($$anchor, text_3);
		};

		Demo(node_4, {
			get component() {
				return Portal;
			},
			file: 'menu/_Portal.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Portal');

				$.append($$anchor, text_4);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.next(2);
	$.reset(section);
	$.append($$anchor, section);
}