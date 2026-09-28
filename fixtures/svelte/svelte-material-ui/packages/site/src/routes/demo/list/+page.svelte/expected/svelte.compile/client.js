import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import GraphicsDense from './_GraphicsDense.svelte';
import NonInteractive from './_NonInteractive.svelte';
import TwoLineSelection from './_TwoLineSelection.svelte';
import ThreeLine from './_ThreeLine.svelte';
import Groups from './_Groups.svelte';
import MultiLevel from './_MultiLevel.svelte';
import Radio from './_Radio.svelte';
import Check from './_Check.svelte';

var root = $.from_html(`<section><h2>Lists</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/list</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('i7bugd', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Lists - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'list/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return GraphicsDense;
		},
		file: 'list/_GraphicsDense.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('A dense list with graphics');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return NonInteractive;
		},
		file: 'list/_NonInteractive.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('A non-interactive list with activated item');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return TwoLineSelection;
		},
		file: 'list/_TwoLineSelection.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('A two-line single selection list with avatars, disabled item, and meta');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return ThreeLine;
		},
		file: 'list/_ThreeLine.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('A three-line list');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Demo(node_5, {
		get component() {
			return Groups;
		},
		file: 'list/_Groups.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('A list group');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return MultiLevel;
		},
		file: 'list/_MultiLevel.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('A multi-level list');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return Radio;
		},
		file: 'list/_Radio.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('A radio list');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_7 = $.text('Also, this uses the selection change event. Try CTRL+A and shift clicking.');

			$.append($$anchor, text_7);
		};

		Demo(node_8, {
			get component() {
				return Check;
			},
			file: 'list/_Check.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_8 = $.text('A check list with trailing checkboxes');

				$.append($$anchor, text_8);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);
	$.append($$anchor, section);
}