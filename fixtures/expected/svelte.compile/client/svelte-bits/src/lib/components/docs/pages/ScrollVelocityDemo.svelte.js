import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollVelocity from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte';
import source from '$lib/components/library/TextAnimations/ScrollVelocity/ScrollVelocity.svelte?raw';

var root = $.from_html(`<div class="w-full"><!></div>`);
var root_1 = $.from_html(`<div class="demo-container relative flex w-full items-center justify-center overflow-hidden" style="height:400px;padding:0;"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Scroll Velocity</h1> <!>`, 1);

export default function ScrollVelocityDemo($$anchor) {
	const DEFAULTS = { velocity: 100, numCopies: 6, damping: 50, stiffness: 400 };
	let velocity = $.state($.proxy(DEFAULTS.velocity));
	let numCopies = $.state($.proxy(DEFAULTS.numCopies));
	let damping = $.state($.proxy(DEFAULTS.damping));
	let stiffness = $.state($.proxy(DEFAULTS.stiffness));
	let replay = $.state(0);
	const hasChanges = $.derived(() => $.get(velocity) !== DEFAULTS.velocity || $.get(numCopies) !== DEFAULTS.numCopies || $.get(damping) !== DEFAULTS.damping || $.get(stiffness) !== DEFAULTS.stiffness);

	function reset() {
		$.set(velocity, DEFAULTS.velocity, true);
		$.set(numCopies, DEFAULTS.numCopies, true);
		$.set(damping, DEFAULTS.damping, true);
		$.set(stiffness, DEFAULTS.stiffness, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<ScrollVelocity
  texts={['Svelte Bits', 'Scroll Down']}
  velocity={${$.get(velocity)}}
  numCopies={${$.get(numCopies)}}
  damping={${$.get(damping)}}
  stiffness={${$.get(stiffness)}}
/>`);

	const props = [
		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional custom scroll container to track. Defaults to window.'
		},

		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'Array of strings to render as scrolling rows. Odd-indexed rows scroll in the opposite direction.'
		},

		{
			name: 'velocity',
			type: 'number',
			default: '100',
			description: 'Base scrolling velocity in px per second. Sign flips for odd-indexed rows.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'CSS class applied to each text copy span.'
		},

		{
			name: 'damping',
			type: 'number',
			default: '50',
			description: 'Damping coefficient for the spring smoothing scroll velocity.'
		},

		{
			name: 'stiffness',
			type: 'number',
			default: '400',
			description: 'Stiffness coefficient for the spring smoothing scroll velocity.'
		},

		{
			name: 'numCopies',
			type: 'number',
			default: '6',
			description: 'Number of text copies rendered in each row for a continuous loop.'
		},

		{
			name: 'velocityMapping',
			type: '{ input: [number, number]; output: [number, number] }',
			default: '{ input: [0, 1000], output: [0, 5] }',
			description: 'Linear mapping from scroll velocity to motion multiplier.'
		},

		{
			name: 'parallaxClass',
			type: 'string',
			default: '"parallax"',
			description: 'CSS class for the parallax container of each row.'
		},

		{
			name: 'scrollerClass',
			type: 'string',
			default: '"scroller"',
			description: 'CSS class for the inner scroller div of each row.'
		},

		{
			name: 'parallaxStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each parallax container.'
		},

		{
			name: 'scrollerStyle',
			type: 'string',
			default: '""',
			description: 'Inline style applied to each scroller div.'
		}
	];

	var fragment = root_3();

	$.head('m7bhyo', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Scroll Velocity - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				var div_1 = root();
				var node_3 = $.child(div_1);

				ScrollVelocity(node_3, {
					texts: ['Svelte Bits', 'Scroll Down'],
					get velocity() {
						return $.get(velocity);
					},

					get numCopies() {
						return $.get(numCopies);
					},

					get damping() {
						return $.get(damping);
					},

					get stiffness() {
						return $.get(stiffness);
					}
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'scroll-velocity',
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
					var fragment_3 = root_2();
					var node_4 = $.first_child(fragment_3);

					PreviewSlider(node_4, {
						title: 'Velocity',
						min: 10,
						max: 500,
						step: 10,
						get value() {
							return $.get(velocity);
						},

						onChange: (v) => {
							$.set(velocity, v, true);
							$.update(replay);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Num Copies',
						min: 2,
						max: 12,
						step: 1,
						get value() {
							return $.get(numCopies);
						},

						onChange: (v) => {
							$.set(numCopies, v, true);
							$.update(replay);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Damping',
						min: 10,
						max: 100,
						step: 5,
						get value() {
							return $.get(damping);
						},

						onChange: (v) => {
							$.set(damping, v, true);
							$.update(replay);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Stiffness',
						min: 100,
						max: 800,
						step: 50,
						get value() {
							return $.get(stiffness);
						},

						onChange: (v) => {
							$.set(stiffness, v, true);
							$.update(replay);
						}
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'ScrollVelocity',
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