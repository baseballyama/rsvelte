import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ShapeBlur from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte';
import source from '$lib/components/library/Animations/ShapeBlur/ShapeBlur.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Shape Blur</h1> <!>`, 1);

export default function ShapeBlurDemo($$anchor) {
	const DEFAULTS = {
		shapeSize: 1.0,
		roundness: 0.5,
		borderSize: 0.05,
		circleSize: 0.25,
		circleEdge: 1
	};

	let shapeSize = $.state($.proxy(DEFAULTS.shapeSize));
	let roundness = $.state($.proxy(DEFAULTS.roundness));
	let borderSize = $.state($.proxy(DEFAULTS.borderSize));
	let circleSize = $.state($.proxy(DEFAULTS.circleSize));
	let circleEdge = $.state($.proxy(DEFAULTS.circleEdge));
	const hasChanges = $.derived(() => $.get(shapeSize) !== DEFAULTS.shapeSize || $.get(roundness) !== DEFAULTS.roundness || $.get(borderSize) !== DEFAULTS.borderSize || $.get(circleSize) !== DEFAULTS.circleSize || $.get(circleEdge) !== DEFAULTS.circleEdge);

	function reset() {
		$.set(shapeSize, DEFAULTS.shapeSize, true);
		$.set(roundness, DEFAULTS.roundness, true);
		$.set(borderSize, DEFAULTS.borderSize, true);
		$.set(circleSize, DEFAULTS.circleSize, true);
		$.set(circleEdge, DEFAULTS.circleEdge, true);
	}

	const usage = $.derived(() => `<ShapeBlur shapeSize={${$.get(shapeSize)}} roundness={${$.get(roundness)}} borderSize={${$.get(borderSize)}} circleSize={${$.get(circleSize)}} circleEdge={${$.get(circleEdge)}} />`);

	const props = [
		{
			name: 'variation',
			type: 'number',
			default: '0',
			description: 'Shape variation index (0-3).'
		},

		{
			name: 'shapeSize',
			type: 'number',
			default: '1.2',
			description: 'Shape size in shader units.'
		},

		{
			name: 'roundness',
			type: 'number',
			default: '0.4',
			description: 'Corner roundness.'
		},

		{
			name: 'borderSize',
			type: 'number',
			default: '0.05',
			description: 'Border thickness.'
		},

		{
			name: 'circleSize',
			type: 'number',
			default: '0.3',
			description: 'Cursor reveal radius.'
		},

		{
			name: 'circleEdge',
			type: 'number',
			default: '0.5',
			description: 'Cursor reveal edge softness.'
		},

		{
			name: 'pixelRatioProp',
			type: 'number',
			default: 'devicePixelRatio',
			description: 'Render pixel ratio.'
		}
	];

	var fragment = root_2();

	$.head('o41bhs', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Shape Blur - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			ShapeBlur(node_1, {
				get shapeSize() {
					return $.get(shapeSize);
				},

				get roundness() {
					return $.get(roundness);
				},

				get borderSize() {
					return $.get(borderSize);
				},

				get circleSize() {
					return $.get(circleSize);
				},

				get circleEdge() {
					return $.get(circleEdge);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'shape-blur',
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

					PreviewSlider(node_2, {
						title: 'Shape Size',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(shapeSize);
						},
						onChange: (v) => $.set(shapeSize, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Roundness',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(roundness);
						},
						onChange: (v) => $.set(roundness, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Border Size',
						min: 0,
						max: 0.3,
						step: 0.01,
						get value() {
							return $.get(borderSize);
						},
						onChange: (v) => $.set(borderSize, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Circle Size',
						min: 0.05,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(circleSize);
						},
						onChange: (v) => $.set(circleSize, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Circle Edge',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(circleEdge);
						},
						onChange: (v) => $.set(circleEdge, v, true)
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
			componentName: 'ShapeBlur',
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