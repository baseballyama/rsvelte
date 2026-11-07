import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Multiple from './_Multiple.svelte';
import DisabledNonInteractive from './_DisabledNonInteractive.svelte';
import Extend from './_Extend.svelte';
import Description from './_Description.svelte';
import Icon from './_Icon.svelte';
import PrimaryColor from './_PrimaryColor.svelte';
import SecondaryColor from './_SecondaryColor.svelte';
import Nested from './_Nested.svelte';
import PaperProps from './_PaperProps.svelte';
import Complex from './_Complex.svelte';

var root = $.from_html(`<section class="svelte-ca630h"><h2 class="svelte-ca630h">Accordion</h2> <h5 class="svelte-ca630h">Installation</h5> <pre class="demo-spaced svelte-ca630h">npm i -D @smui-extra/accordion</pre> <h5 class="svelte-ca630h">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('ca630h', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Accordion - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'accordion/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text = $.text('Allow multiple open panels.');

			$.append($$anchor, text);
		};

		Demo(node_1, {
			get component() {
				return Multiple;
			},
			file: 'accordion/_Multiple.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Multiple');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return DisabledNonInteractive;
		},
		file: 'accordion/_DisabledNonInteractive.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Disabled and Non-Interactive Panels');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Description;
		},
		file: 'accordion/_Description.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Descriptions');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Icon;
		},
		file: 'accordion/_Icon.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Toggle icons');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Extend;
		},
		file: 'accordion/_Extend.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Extending panels');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return PrimaryColor;
		},
		file: 'accordion/_PrimaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Primary color');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return SecondaryColor;
		},
		file: 'accordion/_SecondaryColor.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Secondary color');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Demo(node_8, {
		get component() {
			return Nested;
		},
		file: 'accordion/_Nested.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Nested');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_9 = $.text('The panels are Paper components, so they can take any property that Paper\n      can.');

			$.append($$anchor, text_9);
		};

		Demo(node_9, {
			get component() {
				return PaperProps;
			},
			file: 'accordion/_PaperProps.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_10 = $.text('Paper props');

				$.append($$anchor, text_10);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_10 = $.sibling(node_9, 2);

	Demo(node_10, {
		get component() {
			return Complex;
		},
		file: 'accordion/_Complex.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Complex content');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}