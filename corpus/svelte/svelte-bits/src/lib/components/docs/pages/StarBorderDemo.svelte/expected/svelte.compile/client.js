import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import StarBorder from '$lib/components/library/Animations/StarBorder/StarBorder.svelte';
import starBorderSource from '$lib/components/library/Animations/StarBorder/StarBorder.svelte?raw';

var root = $.from_html(`<div style="min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Star Border</h1> <!>`, 1);

export default function StarBorderDemo($$anchor) {
	const DEFAULTS = { color: '#FF8A4C', speed: 6, thickness: 1 };
	let color = $.state($.proxy(DEFAULTS.color));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let thickness = $.state($.proxy(DEFAULTS.thickness));
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(speed) !== DEFAULTS.speed || $.get(thickness) !== DEFAULTS.thickness);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(thickness, DEFAULTS.thickness, true);
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import StarBorder from '$lib/components/StarBorder.svelte';
${'</' + 'script>'}

<StarBorder
  as="button"
  color="${$.get(color)}"
  speed="${$.get(speed)}s"
  thickness={${$.get(thickness)}}
>
  Star Border
</StarBorder>`);

	const props = [
		{
			name: 'as',
			type: 'string',
			default: '"button"',
			description: 'HTML tag for the wrapper element.'
		},

		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content rendered inside the bordered surface.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"white"',
			description: 'Color of the orbiting radial gradient sweeps.'
		},

		{
			name: 'speed',
			type: 'string',
			default: '"6s"',
			description: 'CSS animation-duration string (e.g. "6s", "2000ms").'
		},

		{
			name: 'thickness',
			type: 'number',
			default: '1',
			description: 'Vertical padding (px) controlling visible border thickness.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	var fragment = root_2();

	$.head('j7axi8', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Star Border - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => `${$.get(speed)}s`);

				StarBorder(node_1, {
					as: 'button',
					get color() {
						return $.get(color);
					},

					get speed() {
						return $.get($0);
					},

					get thickness() {
						return $.get(thickness);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Star Border');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'star-border',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return starBorderSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
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
						min: 1,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(speed);
						},
						valueUnit: 's',
						onChange: (v) => $.set(speed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Thickness',
						min: 1,
						max: 10,
						step: 1,
						get value() {
							return $.get(thickness);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(thickness, v, true)
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
			componentName: 'StarBorder',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return starBorderSource;
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