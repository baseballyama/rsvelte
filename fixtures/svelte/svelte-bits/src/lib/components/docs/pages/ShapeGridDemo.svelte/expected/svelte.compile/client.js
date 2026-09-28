import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import ShapeGrid from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte';
import source from '$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte?raw';

var root = $.from_html(`<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;background:var(--bg-body);"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Shape Grid</h1> <!>`, 1);

export default function ShapeGridDemo($$anchor) {
	const DEFAULTS = {
		shape: 'square',
		direction: 'right',
		speed: 1,
		squareSize: 40,
		hoverTrailAmount: 0,
		borderColor: '#999999',
		hoverFillColor: '#222222'
	};

	let shape = $.state($.proxy(DEFAULTS.shape));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let squareSize = $.state($.proxy(DEFAULTS.squareSize));
	let hoverTrailAmount = $.state($.proxy(DEFAULTS.hoverTrailAmount));
	let borderColor = $.state($.proxy(DEFAULTS.borderColor));
	let hoverFillColor = $.state($.proxy(DEFAULTS.hoverFillColor));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(shape) !== DEFAULTS.shape || $.get(direction) !== DEFAULTS.direction || $.get(speed) !== DEFAULTS.speed || $.get(squareSize) !== DEFAULTS.squareSize || $.get(hoverTrailAmount) !== DEFAULTS.hoverTrailAmount || $.get(borderColor) !== DEFAULTS.borderColor || $.get(hoverFillColor) !== DEFAULTS.hoverFillColor);

	function reset() {
		$.set(shape, DEFAULTS.shape, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(squareSize, DEFAULTS.squareSize, true);
		$.set(hoverTrailAmount, DEFAULTS.hoverTrailAmount, true);
		$.set(borderColor, DEFAULTS.borderColor, true);
		$.set(hoverFillColor, DEFAULTS.hoverFillColor, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import ShapeGrid from '$lib/components/ShapeGrid.svelte';
${scriptClose}

<ShapeGrid
  shape="${$.get(shape)}"
  direction="${$.get(direction)}"
  speed={${$.get(speed)}}
  squareSize={${$.get(squareSize)}}
  hoverTrailAmount={${$.get(hoverTrailAmount)}}
  borderColor="${$.get(borderColor)}"
  hoverFillColor="${$.get(hoverFillColor)}"
/>`);

	const props = [
		{
			name: 'shape',
			type: '"square" | "hexagon" | "circle" | "triangle"',
			default: '"square"',
			description: 'Cell shape rendered across the grid.'
		},

		{
			name: 'direction',
			type: '"diagonal" | "up" | "right" | "down" | "left"',
			default: '"right"',
			description: 'Direction the grid scrolls.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'squareSize',
			type: 'number',
			default: '40',
			description: 'Cell size in pixels.'
		},

		{
			name: 'borderColor',
			type: 'string',
			default: '"#999"',
			description: 'Stroke color of grid cells.'
		},

		{
			name: 'hoverFillColor',
			type: 'string',
			default: '"#222"',
			description: 'Fill color of hovered cells.'
		},

		{
			name: 'hoverTrailAmount',
			type: 'number',
			default: '0',
			description: 'Number of trailing cells highlighted behind the cursor.'
		},

		{
			name: 'fadeColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Color used for the radial fade towards edges.'
		}
	];

	var fragment = root_2();

	$.head('x3ysnj', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Shape Grid - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ShapeGrid(node_1, {
				get shape() {
					return $.get(shape);
				},

				get direction() {
					return $.get(direction);
				},

				get speed() {
					return $.get(speed);
				},

				get squareSize() {
					return $.get(squareSize);
				},

				get hoverTrailAmount() {
					return $.get(hoverTrailAmount);
				},

				get borderColor() {
					return $.get(borderColor);
				},

				get hoverFillColor() {
					return $.get(hoverFillColor);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'shape-grid',
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
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewSelect(node_3, {
						title: 'Shape',
						get value() {
							return $.get(shape);
						},
						options: ['square', 'hexagon', 'circle', 'triangle'],
						onChange: (v) => $.set(shape, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSelect(node_4, {
						title: 'Direction',
						get value() {
							return $.get(direction);
						},
						options: ['right', 'left', 'up', 'down', 'diagonal'],
						onChange: (v) => $.set(direction, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						valueUnit: 'x',
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Square Size',
						min: 10,
						max: 100,
						step: 1,
						get value() {
							return $.get(squareSize);
						},
						onChange: (v) => $.set(squareSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Hover Trail',
						min: 0,
						max: 20,
						step: 1,
						get value() {
							return $.get(hoverTrailAmount);
						},
						onChange: (v) => $.set(hoverTrailAmount, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewColorPicker(node_8, {
						title: 'Border Color',
						get value() {
							return $.get(borderColor);
						},
						onChange: (v) => $.set(borderColor, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewColorPicker(node_9, {
						title: 'Hover Fill',
						get value() {
							return $.get(hoverFillColor);
						},
						onChange: (v) => $.set(hoverFillColor, v, true)
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
			componentName: 'ShapeGrid',
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