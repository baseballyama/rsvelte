import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Positioning from './_Positioning.svelte';
import Rich from './_Rich.svelte';
import Delayed from './_Delayed.svelte';
import Disappearing from './_Disappearing.svelte';

var root = $.from_html(`<section><h2>Toolip</h2> <p>Or tooltip. I can't spell.</p> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/tooltip</pre> <h5>Demos</h5> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('ejim2a', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Tooltip - SMUI';
		});
	});

	var node = $.sibling($.child(section), 10);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'tooltip/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text = $.text('Tooltips position themselves automatically based on proximity to the\n      viewport boundary, but you can give them a default position.');

			$.append($$anchor, text);
		};

		Demo(node_1, {
			get component() {
				return Positioning;
			},
			file: 'tooltip/_Positioning.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Positioning');

				$.append($$anchor, text_1);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Rich;
		},
		file: 'tooltip/_Rich.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Rich');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return Delayed;
		},
		file: 'tooltip/_Delayed.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Delayed');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Disappearing;
		},
		file: 'tooltip/_Disappearing.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Disappearing');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}