import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import VariableProximity from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte';
import source from '$lib/components/library/TextAnimations/VariableProximity/VariableProximity.svelte?raw';

var root = $.from_html(`<div class="demo-container variable-proximity-demo relative flex w-full items-center justify-center overflow-hidden svelte-16lttmn" style="height:400px;padding:1rem;cursor:pointer;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Variable Proximity</h1> <!>`, 1);

export default function VariableProximityDemo($$anchor) {
	const DEFAULTS = { radius: 100, falloff: 'linear' };
	let radius = $.state($.proxy(DEFAULTS.radius));
	let falloff = $.state($.proxy(DEFAULTS.falloff));
	let replay = $.state(0);
	let containerEl = $.state(void 0);
	const hasChanges = $.derived(() => $.get(radius) !== DEFAULTS.radius || $.get(falloff) !== DEFAULTS.falloff);

	function reset() {
		$.set(radius, DEFAULTS.radius, true);
		$.set(falloff, DEFAULTS.falloff, true);
		$.update(replay);
	}

	const usage = $.derived(() => `<VariableProximity
  label="Hover me! And then star Svelte Bits on GitHub, or else..."
  fromFontVariationSettings="'wght' 400, 'opsz' 9"
  toFontVariationSettings="'wght' 1000, 'opsz' 40"
  containerRef={containerEl}
  radius={${$.get(radius)}}
  falloff="${$.get(falloff)}"
/>`);

	const props = [
		{
			name: 'label',
			type: 'string',
			default: '""',
			description: 'The text content to display.'
		},

		{
			name: 'fromFontVariationSettings',
			type: 'string',
			default: "\"'wght' 400, 'opsz' 9\"",
			description: 'Variation settings applied when the cursor is far from the letter.'
		},

		{
			name: 'toFontVariationSettings',
			type: 'string',
			default: "\"'wght' 800, 'opsz' 40\"",
			description: 'Target variation settings reached at the cursor position.'
		},

		{
			name: 'containerRef',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Container used to compute relative cursor position. Without it the effect is disabled.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '50',
			description: 'Proximity radius (in pixels) within which the effect applies.'
		},

		{
			name: 'falloff',
			type: '"linear" | "exponential" | "gaussian"',
			default: '"linear"',
			description: 'Curve shape of the influence falloff with distance.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS class for the wrapper span.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline style for the wrapper span.'
		}
	];

	var fragment = root_2();

	$.head('16lttmn', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Variable Proximity - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ReplayButton(node_1, { onClick: () => $.update(replay) });

			var node_2 = $.sibling(node_1, 2);

			$.key(node_2, () => $.get(replay), ($$anchor) => {
				{
					let $0 = $.derived(() => $.get(containerEl) ?? null);

					VariableProximity($$anchor, {
						label: 'Hover me! And then star Svelte Bits on GitHub, or else...',
						fromFontVariationSettings: '\'wght\' 400, \'opsz\' 9',
						toFontVariationSettings: '\'wght\' 1000, \'opsz\' 40',
						get containerRef() {
							return $.get($0);
						},

						get radius() {
							return $.get(radius);
						},

						get falloff() {
							return $.get(falloff);
						}
					});
				}
			});

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'variable-proximity',
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
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'Radius',
						min: 50,
						max: 300,
						step: 10,
						get value() {
							return $.get(radius);
						},
						valueUnit: 'px',
						onChange: (v) => {
							$.set(radius, v, true);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Falloff',
						get value() {
							return $.get(falloff);
						},

						options: [
							{ value: 'linear', label: 'Linear' },
							{ value: 'exponential', label: 'Exponential' },
							{ value: 'gaussian', label: 'Gaussian' }
						],

						onChange: (v) => {
							$.set(falloff, v, true);
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
			componentName: 'VariableProximity',
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