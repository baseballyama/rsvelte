import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Showcase from './_Showcase.svelte';
import Keys from './_Keys.svelte';
import Forms from './_Forms.svelte';
import Invalid from './_Invalid.svelte';
import Standard from './_Standard.svelte';
import Filled from './_Filled.svelte';
import Outlined from './_Outlined.svelte';
import ShapedFilled from './_ShapedFilled.svelte';
import ShapedOutlined from './_ShapedOutlined.svelte';
import Required from './_Required.svelte';
import Disabled from './_Disabled.svelte';
import ConditionalIcon from './_ConditionalIcon.svelte';

var root = $.from_html(
	`If your options aren't strings, you must provide a <code class="svelte-1cf6sxh">key</code> function
      that converts them to unique strings, or the label may misbehave.`,
	1
);

var root_1 = $.from_html(
	`If you put a <code class="svelte-1cf6sxh">Select</code> in a <code class="svelte-1cf6sxh">&lt;form&gt;</code>, you have
      to add the <code class="svelte-1cf6sxh">hiddenInput</code> and <code class="svelte-1cf6sxh">input$name</code> props to have
      it sent with the rest of the inputs.`,
	1
);

var root_2 = $.from_html(`<section class="svelte-1cf6sxh"><h2 class="svelte-1cf6sxh">Select</h2> <h5 class="svelte-1cf6sxh">Installation</h5> <pre class="demo-spaced svelte-1cf6sxh">npm i -D @smui/select</pre> <h5 class="svelte-1cf6sxh">Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root_2();

	$.head('1cf6sxh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Select - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Showcase;
		},
		file: 'select/_Showcase.svelte'
	});

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		};

		Demo(node_1, {
			get component() {
				return Keys;
			},
			file: 'select/_Keys.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Using Keys');

				$.append($$anchor, text);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var fragment_1 = root_1();

			$.next(8);
			$.append($$anchor, fragment_1);
		};

		Demo(node_2, {
			get component() {
				return Forms;
			},
			file: 'select/_Forms.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Using Forms');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Invalid;
		},
		file: 'select/_Invalid.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Dynamic Invalid State');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Standard;
		},
		file: 'select/_Standard.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Standard');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Filled;
		},
		file: 'select/_Filled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Filled');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return Outlined;
		},
		file: 'select/_Outlined.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Outlined');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_6 = $.text('Styled with CSS');

			$.append($$anchor, text_6);
		};

		Demo(node_7, {
			get component() {
				return ShapedFilled;
			},
			file: 'select/_ShapedFilled.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_7 = $.text('Shaped Filled');

				$.append($$anchor, text_7);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_8 = $.sibling(node_7, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_8 = $.text('Styled with CSS');

			$.append($$anchor, text_8);
		};

		Demo(node_8, {
			get component() {
				return ShapedOutlined;
			},
			file: 'select/_ShapedOutlined.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_9 = $.text('Shaped Outlined');

				$.append($$anchor, text_9);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_9 = $.sibling(node_8, 2);

	Demo(node_9, {
		get component() {
			return Required;
		},
		file: 'select/_Required.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Required');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Demo(node_10, {
		get component() {
			return Disabled;
		},
		file: 'select/_Disabled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Disabled');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Demo(node_11, {
		get component() {
			return ConditionalIcon;
		},
		file: 'select/_ConditionalIcon.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Conditional icon');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}