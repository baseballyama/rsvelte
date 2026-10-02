import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ElectricBorder from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte';
import source from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte?raw';

var root = $.from_html(`<div style="padding:2rem 1.5rem;background:#0a0a0a;border-radius:16px;color:#fff;text-align:center;"><h3 style="margin:0 0 .5rem;font-size:1.25rem;font-weight:700;">Electric</h3> <p style="margin:0;color:#aaa;font-size:.9rem;">Hover, click, or just admire the bouncy current crawling around the edges.</p></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Electric Border</h1> <!>`, 1);

export default function ElectricBorderDemo($$anchor) {
	const DEFAULTS = { color: '#FF8A4C', speed: 1, chaos: 0.12, borderRadius: 16 };
	let color = $.state($.proxy(DEFAULTS.color));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let chaos = $.state($.proxy(DEFAULTS.chaos));
	let borderRadius = $.state($.proxy(DEFAULTS.borderRadius));
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(speed) !== DEFAULTS.speed || $.get(chaos) !== DEFAULTS.chaos || $.get(borderRadius) !== DEFAULTS.borderRadius);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(chaos, DEFAULTS.chaos, true);
		$.set(borderRadius, DEFAULTS.borderRadius, true);
	}

	const usage = $.derived(() => `<ElectricBorder color="${$.get(color)}" speed={${$.get(speed)}} chaos={${$.get(chaos)}} borderRadius={${$.get(borderRadius)}}>
  <div>Your content</div>
</ElectricBorder>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: 'required',
			description: 'Content wrapped by the electric border.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Border color.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'chaos',
			type: 'number',
			default: '0.12',
			description: 'Distortion noise scale.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '24',
			description: 'Corner radius (px).'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Wrapper class.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline style.'
		}
	];

	var fragment = root_3();

	$.head('zpom17', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Electric Border - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			ElectricBorder(node_1, {
				get color() {
					return $.get(color);
				},

				get speed() {
					return $.get(speed);
				},

				get chaos() {
					return $.get(chaos);
				},

				get borderRadius() {
					return $.get(borderRadius);
				},
				style: 'width:300px;',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'electric-border',
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
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Chaos',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(chaos);
						},
						onChange: (v) => $.set(chaos, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Border Radius',
						min: 0,
						max: 64,
						step: 1,
						get value() {
							return $.get(borderRadius);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(borderRadius, v, true)
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
			componentName: 'ElectricBorder',
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