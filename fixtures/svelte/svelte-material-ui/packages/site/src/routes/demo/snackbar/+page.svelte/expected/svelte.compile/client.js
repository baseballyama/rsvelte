import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import LeadingWithAction from './_LeadingWithAction.svelte';
import StackedWithAction from './_StackedWithAction.svelte';
import DynamicText from './_DynamicText.svelte';
import Colors from './_Colors.svelte';
import Kitchen from './_Kitchen.svelte';
import KitchenSvg from './_KitchenSvg.svelte';

var root = $.from_html(`<section><h2>Snackbar</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/snackbar</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('k8nyue', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Snackbar - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'snackbar/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return LeadingWithAction;
		},
		file: 'snackbar/_LeadingWithAction.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Leading with action');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return StackedWithAction;
		},
		file: 'snackbar/_StackedWithAction.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Stacked with action');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_2 = $.text('This demo is set to not close automatically, so you can more easily test\n      it.');

			$.append($$anchor, text_2);
		};

		Demo(node_3, {
			get component() {
				return DynamicText;
			},
			file: 'snackbar/_DynamicText.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Using dynamic text');

				$.append($$anchor, text_3);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Colors;
		},
		files: ['snackbar/_Colors.svelte', 'snackbar/_Colors.scss'],
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Colored snackbars');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Kitchen;
		},
		file: 'snackbar/_Kitchen.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('The "Kitchen" Snackbar generator');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return KitchenSvg;
		},
		file: 'snackbar/_KitchenSvg.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Kitchen, with an SVG dismiss button');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}