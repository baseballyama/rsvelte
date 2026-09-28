import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CursorGrid from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte';
import source from '$lib/components/library/Animations/CursorGrid/CursorGrid.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <p class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(2rem,6vw,3rem)] font-black" style="color:var(--text-secondary)">Move Your Cursor</p></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Cursor Grid</h1> <!>`, 1);

export default function CursorGridDemo($$anchor) {
	const D = {
		cellSize: 70,
		color: '#D946EF',
		radius: 140,
		falloff: 'smooth',
		holdTime: 400,
		fadeDuration: 800,
		lineWidth: 1.2,
		maxOpacity: 1,
		fillOpacity: 0,
		gridOpacity: 0,
		cellRadius: 0,
		clickPulse: true,
		pulseSpeed: 600
	};

	let cellSize = $.state($.proxy(D.cellSize));
	let color = $.state($.proxy(D.color));
	let radius = $.state($.proxy(D.radius));
	let falloff = $.state($.proxy(D.falloff));
	let holdTime = $.state($.proxy(D.holdTime));
	let fadeDuration = $.state($.proxy(D.fadeDuration));
	let lineWidth = $.state($.proxy(D.lineWidth));
	let maxOpacity = $.state($.proxy(D.maxOpacity));
	let fillOpacity = $.state($.proxy(D.fillOpacity));
	let gridOpacity = $.state($.proxy(D.gridOpacity));
	let cellRadius = $.state($.proxy(D.cellRadius));
	let clickPulse = $.state($.proxy(D.clickPulse));
	let pulseSpeed = $.state($.proxy(D.pulseSpeed));
	const hasChanges = $.derived(() => $.get(cellSize) !== D.cellSize || $.get(color) !== D.color || $.get(radius) !== D.radius || $.get(falloff) !== D.falloff || $.get(holdTime) !== D.holdTime || $.get(fadeDuration) !== D.fadeDuration || $.get(lineWidth) !== D.lineWidth || $.get(maxOpacity) !== D.maxOpacity || $.get(fillOpacity) !== D.fillOpacity || $.get(gridOpacity) !== D.gridOpacity || $.get(cellRadius) !== D.cellRadius || $.get(clickPulse) !== D.clickPulse || $.get(pulseSpeed) !== D.pulseSpeed);

	function reset() {
		$.set(cellSize, D.cellSize, true);
		$.set(color, D.color, true);
		$.set(radius, D.radius, true);
		$.set(falloff, D.falloff, true);
		$.set(holdTime, D.holdTime, true);
		$.set(fadeDuration, D.fadeDuration, true);
		$.set(lineWidth, D.lineWidth, true);
		$.set(maxOpacity, D.maxOpacity, true);
		$.set(fillOpacity, D.fillOpacity, true);
		$.set(gridOpacity, D.gridOpacity, true);
		$.set(cellRadius, D.cellRadius, true);
		$.set(clickPulse, D.clickPulse, true);
		$.set(pulseSpeed, D.pulseSpeed, true);
	}

	const usage = $.derived(() => `<CursorGrid cellSize={${$.get(cellSize)}} color="${$.get(color)}" radius={${$.get(radius)}} falloff="${$.get(falloff)}" clickPulse={${$.get(clickPulse)}} />`);

	const props = [
		{
			name: 'cellSize',
			type: 'number',
			default: '70',
			description: 'Grid cell size in px.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#D946EF"',
			description: 'Color of lit cells.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '140',
			description: 'Cursor influence radius in px.'
		},

		{
			name: 'falloff',
			type: '"linear" | "smooth" | "sharp"',
			default: '"smooth"',
			description: 'Easing curve mapping distance to brightness.'
		},

		{
			name: 'holdTime',
			type: 'number',
			default: '400',
			description: 'Time in ms a cell stays lit before fading.'
		},

		{
			name: 'fadeDuration',
			type: 'number',
			default: '800',
			description: 'Fade-out duration in ms.'
		},

		{
			name: 'lineWidth',
			type: 'number',
			default: '1.2',
			description: 'Cell stroke width in px.'
		},

		{
			name: 'maxOpacity',
			type: 'number',
			default: '1',
			description: 'Maximum stroke opacity for a lit cell.'
		},

		{
			name: 'fillOpacity',
			type: 'number',
			default: '0',
			description: 'Fill opacity for a lit cell.'
		},

		{
			name: 'gridOpacity',
			type: 'number',
			default: '0',
			description: 'Opacity of the faint static lattice.'
		},

		{
			name: 'cellRadius',
			type: 'number',
			default: '0',
			description: 'Corner radius of each cell in px.'
		},

		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Emit an expanding ring pulse on click.'
		},

		{
			name: 'pulseSpeed',
			type: 'number',
			default: '600',
			description: 'Click pulse expansion speed in px/s.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	var fragment = root_2();

	$.head('wmccys', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Cursor Grid - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			CursorGrid(node_1, {
				get cellSize() {
					return $.get(cellSize);
				},

				get color() {
					return $.get(color);
				},

				get radius() {
					return $.get(radius);
				},

				get falloff() {
					return $.get(falloff);
				},

				get holdTime() {
					return $.get(holdTime);
				},

				get fadeDuration() {
					return $.get(fadeDuration);
				},

				get lineWidth() {
					return $.get(lineWidth);
				},

				get maxOpacity() {
					return $.get(maxOpacity);
				},

				get fillOpacity() {
					return $.get(fillOpacity);
				},

				get gridOpacity() {
					return $.get(gridOpacity);
				},

				get cellRadius() {
					return $.get(cellRadius);
				},

				get clickPulse() {
					return $.get(clickPulse);
				},

				get pulseSpeed() {
					return $.get(pulseSpeed);
				}
			});

			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'cursor-grid',
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
						title: 'Cell Size',
						min: 20,
						max: 160,
						step: 2,
						get value() {
							return $.get(cellSize);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(cellSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Radius',
						min: 20,
						max: 400,
						step: 5,
						get value() {
							return $.get(radius);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(radius, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSelect(node_5, {
						title: 'Falloff',
						get value() {
							return $.get(falloff);
						},

						options: [
							{ label: 'Linear', value: 'linear' },
							{ label: 'Smooth', value: 'smooth' },
							{ label: 'Sharp', value: 'sharp' }
						],
						onChange: (v) => $.set(falloff, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Hold Time',
						min: 0,
						max: 2000,
						step: 50,
						get value() {
							return $.get(holdTime);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(holdTime, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Fade Duration',
						min: 100,
						max: 3000,
						step: 50,
						get value() {
							return $.get(fadeDuration);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(fadeDuration, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Line Width',
						min: 0.5,
						max: 6,
						step: 0.1,
						get value() {
							return $.get(lineWidth);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(lineWidth, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Max Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(maxOpacity);
						},
						onChange: (v) => $.set(maxOpacity, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Fill Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(fillOpacity);
						},
						onChange: (v) => $.set(fillOpacity, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Grid Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(gridOpacity);
						},
						onChange: (v) => $.set(gridOpacity, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Cell Radius',
						min: 0,
						max: 40,
						step: 1,
						get value() {
							return $.get(cellRadius);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(cellRadius, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Click Pulse',
						get checked() {
							return $.get(clickPulse);
						},
						onChange: (v) => $.set(clickPulse, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Pulse Speed',
						min: 100,
						max: 2000,
						step: 25,
						get value() {
							return $.get(pulseSpeed);
						},
						valueUnit: 'px/s',
						onChange: (v) => $.set(pulseSpeed, v, true)
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
			componentName: 'CursorGrid',
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