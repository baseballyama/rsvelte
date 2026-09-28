import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MagnetLines from '$lib/components/library/Animations/MagnetLines/MagnetLines.svelte';
import source from '$lib/components/library/Animations/MagnetLines/MagnetLines.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Magnet Lines</h1> <!>`, 1);

export default function MagnetLinesDemo($$anchor) {
	const DEFAULTS = {
		rows: 10,
		columns: 12,
		containerSize: '40vmin',
		lineWidth: '2px',
		lineHeight: '30px',
		baseAngle: -10,
		lineColor: '#FF8A4C'
	};

	let rows = $.state($.proxy(DEFAULTS.rows));
	let columns = $.state($.proxy(DEFAULTS.columns));
	let containerSize = $.state($.proxy(DEFAULTS.containerSize));
	let lineWidth = $.state($.proxy(DEFAULTS.lineWidth));
	let lineHeight = $.state($.proxy(DEFAULTS.lineHeight));
	let baseAngle = $.state($.proxy(DEFAULTS.baseAngle));
	let lineColor = $.state($.proxy(DEFAULTS.lineColor));
	const hasChanges = $.derived(() => $.get(rows) !== DEFAULTS.rows || $.get(columns) !== DEFAULTS.columns || $.get(lineHeight) !== DEFAULTS.lineHeight || $.get(baseAngle) !== DEFAULTS.baseAngle || $.get(lineColor) !== DEFAULTS.lineColor);

	function reset() {
		$.set(rows, DEFAULTS.rows, true);
		$.set(columns, DEFAULTS.columns, true);
		$.set(containerSize, DEFAULTS.containerSize, true);
		$.set(lineWidth, DEFAULTS.lineWidth, true);
		$.set(lineHeight, DEFAULTS.lineHeight, true);
		$.set(baseAngle, DEFAULTS.baseAngle, true);
		$.set(lineColor, DEFAULTS.lineColor, true);
	}

	const lineHeightNum = $.derived(() => parseInt($.get(lineHeight)) || 30);
	const usage = $.derived(() => `<MagnetLines rows={${$.get(rows)}} columns={${$.get(columns)}} containerSize="${$.get(containerSize)}" lineColor="${$.get(lineColor)}" lineWidth="${$.get(lineWidth)}" lineHeight="${$.get(lineHeight)}" baseAngle={${$.get(baseAngle)}} />`);

	const props = [
		{
			name: 'rows',
			type: 'number',
			default: '9',
			description: 'Number of grid rows.'
		},

		{
			name: 'columns',
			type: 'number',
			default: '9',
			description: 'Number of grid columns.'
		},

		{
			name: 'containerSize',
			type: 'string',
			default: '"80vmin"',
			description: 'Width and height of the entire grid container.'
		},

		{
			name: 'lineColor',
			type: 'string',
			default: '"#efefef"',
			description: 'Color of each line.'
		},

		{
			name: 'lineWidth',
			type: 'string',
			default: '"1vmin"',
			description: 'Width of each line.'
		},

		{
			name: 'lineHeight',
			type: 'string',
			default: '"6vmin"',
			description: 'Height (length) of each line.'
		},

		{
			name: 'baseAngle',
			type: 'number',
			default: '-10',
			description: 'Initial rotation angle (deg).'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class.'
		}
	];

	var fragment = root_2();

	$.head('bysq33', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Magnet Lines - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			MagnetLines(node_1, {
				get rows() {
					return $.get(rows);
				},

				get columns() {
					return $.get(columns);
				},

				get containerSize() {
					return $.get(containerSize);
				},

				get lineColor() {
					return $.get(lineColor);
				},

				get lineWidth() {
					return $.get(lineWidth);
				},

				get lineHeight() {
					return $.get(lineHeight);
				},

				get baseAngle() {
					return $.get(baseAngle);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'magnet-lines',
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
						title: 'Line Color',
						get value() {
							return $.get(lineColor);
						},
						onChange: (v) => $.set(lineColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Rows',
						min: 3,
						max: 20,
						step: 1,
						get value() {
							return $.get(rows);
						},
						onChange: (v) => $.set(rows, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Columns',
						min: 3,
						max: 20,
						step: 1,
						get value() {
							return $.get(columns);
						},
						onChange: (v) => $.set(columns, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Line Length',
						min: 10,
						max: 80,
						step: 2,
						get value() {
							return $.get(lineHeightNum);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(lineHeight, `${v}px`)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Base Angle',
						min: -90,
						max: 90,
						step: 5,
						get value() {
							return $.get(baseAngle);
						},
						valueUnit: '°',
						onChange: (v) => $.set(baseAngle, v, true)
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
			componentName: 'MagnetLines',
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