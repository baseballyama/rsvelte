import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Edges from '$lib/components/generator/Edges/Edges.svelte';
import * as constants from '$lib/constants/generator';
import { settingsCorners, settingsEdges } from '$lib/state/generator.svelte';

var root = $.from_html(`<div class="space-y-8"><section class="space-y-2"><header><h2 class="h5">Border Radius</h2> <p class="opacity-50">Adjust settings for border radius utility classes.</p></header> <div class="label"><span class="label-text">Base</span> <!></div> <div class="label"><span class="label-text">Container</span> <!></div></section> <section class="space-y-4"><header><h2 class="h5">Corner Shape</h2> <p class="opacity-50">Available via the the <a class="underline" href="https://skeleton.dev/docs/svelte/tailwind-utilities/corner-shapes" target="_blank" rel="noopener noreferrer">corner shape</a> utility.</p></header> <div class="label"><span class="label-text">Base</span> <!></div> <div class="label"><span class="label-text">Container</span> <!></div></section> <section class="space-y-4"><header><h2 class="h5">Edge Defaults</h2> <p class="opacity-50">Set the default edge sizing.</p></header> <div class="label"><span class="label-text">Border Width</span> <!></div> <div class="label"><span class="label-text">Ring Width</span> <!></div> <div class="label"><span class="label-text">Outline Width</span> <!></div></section></div>`);

export default function ControlsEdges($$anchor, $$props) {
	$.push($$props, true);

	// Constants
	// Components
	// State
	// The 'inherit' corner shape has no distinct visual, so it's excluded from the preview grid.
	const cornerShapeOptions = constants.cornerShapes.filter((shape) => shape !== 'inherit');

	var div = root();
	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 2);
	var node = $.sibling($.child(div_1), 2);

	Edges(node, {
		name: 'rounded-base',
		items: [
			'0rem',
			'0.063rem',
			'0.125rem',
			'0.25rem',
			'0.375rem',
			'0.75rem',
			'9999rem'
		],

		get value() {
			return settingsEdges['--radius-base'];
		},

		set value($$value) {
			settingsEdges['--radius-base'] = $$value;
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Edges(node_1, {
		name: 'rounded-container',
		items: [
			'0rem',
			'0.063rem',
			'0.125rem',
			'0.25rem',
			'0.375rem',
			'0.75rem',
			'1.5rem'
		],

		get value() {
			return settingsEdges['--radius-container'];
		},

		set value($$value) {
			settingsEdges['--radius-container'] = $$value;
		}
	});

	$.reset(div_2);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_3 = $.sibling($.child(section_1), 2);
	var node_2 = $.sibling($.child(div_3), 2);

	Edges(node_2, {
		name: '--corner-shape-base',
		get items() {
			return cornerShapeOptions;
		},
		mode: 'corner',
		get value() {
			return settingsCorners['--corner-shape-base'];
		},

		set value($$value) {
			settingsCorners['--corner-shape-base'] = $$value;
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_3 = $.sibling($.child(div_4), 2);

	Edges(node_3, {
		name: '--corner-shape-container',
		get items() {
			return cornerShapeOptions;
		},
		mode: 'corner',
		get value() {
			return settingsCorners['--corner-shape-container'];
		},

		set value($$value) {
			settingsCorners['--corner-shape-container'] = $$value;
		}
	});

	$.reset(div_4);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_5 = $.sibling($.child(section_2), 2);
	var node_4 = $.sibling($.child(div_5), 2);

	Edges(node_4, {
		name: 'borders',
		items: ['1px', '2px', '4px', '6px'],
		mode: 'thickness',
		get value() {
			return settingsEdges['--default-border-width'];
		},

		set value($$value) {
			settingsEdges['--default-border-width'] = $$value;
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.sibling($.child(div_6), 2);

	Edges(node_5, {
		name: 'rings',
		items: ['1px', '2px', '4px', '6px'],
		mode: 'thickness',
		get value() {
			return settingsEdges['--default-ring-width'];
		},

		set value($$value) {
			settingsEdges['--default-ring-width'] = $$value;
		}
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_6 = $.sibling($.child(div_7), 2);

	Edges(node_6, {
		name: 'outlines',
		items: ['1px', '2px', '4px', '6px'],
		mode: 'thickness',
		get value() {
			return settingsEdges['--default-outline-width'];
		},

		set value($$value) {
			settingsEdges['--default-outline-width'] = $$value;
		}
	});

	$.reset(div_7);
	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}