import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Demo from '$lib/Demo.svelte';
import Simple from './_Simple.svelte';
import Continuous from './_Continuous.svelte';
import Discrete from './_Discrete.svelte';
import TickMarks from './_TickMarks.svelte';
import Range from './_Range.svelte';
import MinRange from './_MinRange.svelte';
import DiscreteRange from './_DiscreteRange.svelte';
import Disabled from './_Disabled.svelte';

var root = $.from_html(`<section><h2>Slider</h2> <h5>Installation</h5> <pre class="demo-spaced">npm i -D @smui/slider</pre> <h5>Demos</h5> <!> <!> <!> <!> <!> <!> <!> <!></section>`);

export default function _page($$anchor) {
	var section = root();

	$.head('1j2ytac', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Slider - SMUI';
		});
	});

	var node = $.sibling($.child(section), 8);

	Demo(node, {
		get component() {
			return Simple;
		},
		file: 'slider/_Simple.svelte'
	});

	var node_1 = $.sibling(node, 2);

	Demo(node_1, {
		get component() {
			return Continuous;
		},
		file: 'slider/_Continuous.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Continuous');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Demo(node_2, {
		get component() {
			return Discrete;
		},
		file: 'slider/_Discrete.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Discrete with min/max/step');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Demo(node_3, {
		get component() {
			return TickMarks;
		},
		file: 'slider/_TickMarks.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Adding tick marks to discrete');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Demo(node_4, {
		get component() {
			return Range;
		},
		file: 'slider/_Range.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Range slider');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_4 = $.text('Limit the range the user can select to a minimum value.');

			$.append($$anchor, text_4);
		};

		Demo(node_5, {
			get component() {
				return MinRange;
			},
			file: 'slider/_MinRange.svelte',
			subtitle,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Min range slider');

				$.append($$anchor, text_5);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	Demo(node_6, {
		get component() {
			return DiscreteRange;
		},
		file: 'slider/_DiscreteRange.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Discrete range slider with tick marks');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Demo(node_7, {
		get component() {
			return Disabled;
		},
		file: 'slider/_Disabled.svelte',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Disabled');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(section);
	$.append($$anchor, section);
}