import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import DecayCard from '$lib/components/library/Components/DecayCard/DecayCard.svelte';
import source from '$lib/components/library/Components/DecayCard/DecayCard.svelte?raw';

var root = $.from_html(`<span style="color:#fff;">The<br/>Decay<br/>Card</span>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:600px;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Decay Card</h1> <!>`, 1);

export default function DecayCardDemo($$anchor) {
	const DEFAULTS = {
		baseFrequency: 0.015,
		numOctaves: 5,
		seed: 4,
		maxDisplacement: 400,
		movementBound: 50
	};

	let baseFrequency = $.state($.proxy(DEFAULTS.baseFrequency));
	let numOctaves = $.state($.proxy(DEFAULTS.numOctaves));
	let seed = $.state($.proxy(DEFAULTS.seed));
	let maxDisplacement = $.state($.proxy(DEFAULTS.maxDisplacement));
	let movementBound = $.state($.proxy(DEFAULTS.movementBound));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(baseFrequency) !== DEFAULTS.baseFrequency || $.get(numOctaves) !== DEFAULTS.numOctaves || $.get(seed) !== DEFAULTS.seed || $.get(maxDisplacement) !== DEFAULTS.maxDisplacement || $.get(movementBound) !== DEFAULTS.movementBound);

	function reset() {
		$.set(baseFrequency, DEFAULTS.baseFrequency, true);
		$.set(numOctaves, DEFAULTS.numOctaves, true);
		$.set(seed, DEFAULTS.seed, true);
		$.set(maxDisplacement, DEFAULTS.maxDisplacement, true);
		$.set(movementBound, DEFAULTS.movementBound, true);
		$.update(key);
	}

	const usage = $.derived(() => `<DecayCard baseFrequency={${$.get(baseFrequency)}} numOctaves={${$.get(numOctaves)}} seed={${$.get(seed)}} maxDisplacement={${$.get(maxDisplacement)}} movementBound={${$.get(movementBound)}} />`);

	const props = [
		{
			name: 'width',
			type: 'number',
			default: '300',
			description: 'Card width.'
		},

		{
			name: 'height',
			type: 'number',
			default: '400',
			description: 'Card height.'
		},

		{
			name: 'image',
			type: 'string',
			default: 'picsum.photos/300/400',
			description: 'Image URL.'
		},

		{
			name: 'baseFrequency',
			type: 'number',
			default: '0.015',
			description: 'Turbulence base frequency.'
		},

		{
			name: 'numOctaves',
			type: 'number',
			default: '5',
			description: 'Turbulence octaves.'
		},

		{
			name: 'seed',
			type: 'number',
			default: '4',
			description: 'Turbulence seed.'
		},

		{
			name: 'maxDisplacement',
			type: 'number',
			default: '400',
			description: 'Max SVG displacement scale.'
		},

		{
			name: 'movementBound',
			type: 'number',
			default: '50',
			description: 'Soft clamp for image translation.'
		}
	];

	var fragment = root_3();

	$.head('6fpp8g', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Decay Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				{
					const children = ($$anchor) => {
						var span = root();

						$.append($$anchor, span);
					};

					DecayCard($$anchor, {
						get baseFrequency() {
							return $.get(baseFrequency);
						},

						get numOctaves() {
							return $.get(numOctaves);
						},

						get seed() {
							return $.get(seed);
						},

						get maxDisplacement() {
							return $.get(maxDisplacement);
						},

						get movementBound() {
							return $.get(movementBound);
						},
						children,
						$$slots: { default: true }
					});
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'decay-card',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Base Frequency',
						min: 0,
						max: 0.1,
						step: 0.001,
						get value() {
							return $.get(baseFrequency);
						},

						onChange: (v) => {
							$.set(baseFrequency, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Octaves',
						min: 1,
						max: 10,
						step: 1,
						get value() {
							return $.get(numOctaves);
						},

						onChange: (v) => {
							$.set(numOctaves, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Seed',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(seed);
						},

						onChange: (v) => {
							$.set(seed, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Max Displacement',
						min: 0,
						max: 1000,
						step: 10,
						get value() {
							return $.get(maxDisplacement);
						},

						onChange: (v) => {
							$.set(maxDisplacement, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Movement Bound',
						min: 0,
						max: 300,
						step: 5,
						get value() {
							return $.get(movementBound);
						},

						onChange: (v) => {
							$.set(movementBound, v, true);
							$.update(key);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'DecayCard',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}