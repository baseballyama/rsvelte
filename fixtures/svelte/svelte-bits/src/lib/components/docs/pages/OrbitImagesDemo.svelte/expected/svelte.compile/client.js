import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import OrbitImages from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte';
import source from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Orbit Images</h1> <!>`, 1);

export default function OrbitImagesDemo($$anchor) {
	const images = Array.from({ length: 6 }, (_, i) => `https://picsum.photos/300/300?grayscale&random=${i + 1}`);

	const DEFAULTS = {
		shape: 'ellipse',
		radiusX: 340,
		radiusY: 80,
		radius: 160,
		rotation: -8,
		duration: 30,
		itemSize: 80,
		direction: 'normal',
		fill: true,
		showPath: true,
		paused: false
	};

	let shape = $.state($.proxy(DEFAULTS.shape));
	let radiusX = $.state($.proxy(DEFAULTS.radiusX));
	let radiusY = $.state($.proxy(DEFAULTS.radiusY));
	let radius = $.state($.proxy(DEFAULTS.radius));
	let rotation = $.state($.proxy(DEFAULTS.rotation));
	let duration = $.state($.proxy(DEFAULTS.duration));
	let itemSize = $.state($.proxy(DEFAULTS.itemSize));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let fill = $.state($.proxy(DEFAULTS.fill));
	let showPath = $.state($.proxy(DEFAULTS.showPath));
	let paused = $.state($.proxy(DEFAULTS.paused));
	const hasChanges = $.derived(() => $.get(shape) !== DEFAULTS.shape || $.get(radiusX) !== DEFAULTS.radiusX || $.get(radiusY) !== DEFAULTS.radiusY || $.get(radius) !== DEFAULTS.radius || $.get(rotation) !== DEFAULTS.rotation || $.get(duration) !== DEFAULTS.duration || $.get(itemSize) !== DEFAULTS.itemSize || $.get(direction) !== DEFAULTS.direction || $.get(fill) !== DEFAULTS.fill || $.get(showPath) !== DEFAULTS.showPath || $.get(paused) !== DEFAULTS.paused);

	function reset() {
		$.set(shape, DEFAULTS.shape, true);
		$.set(radiusX, DEFAULTS.radiusX, true);
		$.set(radiusY, DEFAULTS.radiusY, true);
		$.set(radius, DEFAULTS.radius, true);
		$.set(rotation, DEFAULTS.rotation, true);
		$.set(duration, DEFAULTS.duration, true);
		$.set(itemSize, DEFAULTS.itemSize, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(fill, DEFAULTS.fill, true);
		$.set(showPath, DEFAULTS.showPath, true);
		$.set(paused, DEFAULTS.paused, true);
	}

	const usage = $.derived(() => `<OrbitImages images={images} shape="${$.get(shape)}" radiusX={${$.get(radiusX)}} radiusY={${$.get(radiusY)}} radius={${$.get(radius)}} rotation={${$.get(rotation)}} duration={${$.get(duration)}} itemSize={${$.get(itemSize)}} direction="${$.get(direction)}" fill={${$.get(fill)}} showPath={${$.get(showPath)}} paused={${$.get(paused)}} responsive />`);

	const props = [
		{
			name: 'images',
			type: 'string[]',
			default: '[]',
			description: 'Image URLs to orbit along the path.'
		},

		{
			name: 'shape',
			type: 'OrbitShape',
			default: '"ellipse"',
			description: 'ellipse, circle, square, rectangle, triangle, star, heart, infinity, wave, custom.'
		},

		{
			name: 'customPath',
			type: 'string',
			default: 'undefined',
			description: 'Custom SVG path (used when shape="custom").'
		},

		{
			name: 'baseWidth',
			type: 'number',
			default: '1400',
			description: 'Base coordinate space width.'
		},

		{
			name: 'radiusX',
			type: 'number',
			default: '700',
			description: 'Horizontal radius for ellipse/rectangle/infinity/wave.'
		},

		{
			name: 'radiusY',
			type: 'number',
			default: '170',
			description: 'Vertical radius for ellipse/rectangle/infinity/wave.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '300',
			description: 'Radius for circle, square, triangle, star, heart.'
		},

		{
			name: 'starPoints',
			type: 'number',
			default: '5',
			description: 'Star point count.'
		},

		{
			name: 'starInnerRatio',
			type: 'number',
			default: '0.5',
			description: 'Inner radius ratio for star.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '-8',
			description: 'Rotation of entire orbit (deg).'
		},

		{
			name: 'duration',
			type: 'number',
			default: '40',
			description: 'One full orbit duration (s).'
		},

		{
			name: 'itemSize',
			type: 'number',
			default: '64',
			description: 'Each item width/height (px).'
		},

		{
			name: 'direction',
			type: '"normal" | "reverse"',
			default: '"normal"',
			description: 'Orbit direction.'
		},

		{
			name: 'fill',
			type: 'boolean',
			default: 'true',
			description: 'Distribute items evenly.'
		},

		{
			name: 'showPath',
			type: 'boolean',
			default: 'false',
			description: 'Show the orbit path.'
		},

		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Pause the animation.'
		},

		{
			name: 'responsive',
			type: 'boolean',
			default: 'false',
			description: 'Scale orbit responsively to container width.'
		}
	];

	var fragment = root_2();

	$.head('1mnrm7q', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Orbit Images - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			OrbitImages(node_1, {
				get images() {
					return images;
				},

				get shape() {
					return $.get(shape);
				},

				get radiusX() {
					return $.get(radiusX);
				},

				get radiusY() {
					return $.get(radiusY);
				},

				get radius() {
					return $.get(radius);
				},

				get rotation() {
					return $.get(rotation);
				},

				get duration() {
					return $.get(duration);
				},

				get itemSize() {
					return $.get(itemSize);
				},

				get direction() {
					return $.get(direction);
				},

				get fill() {
					return $.get(fill);
				},

				get showPath() {
					return $.get(showPath);
				},

				get paused() {
					return $.get(paused);
				},
				responsive: true,
				pathColor: 'rgba(255,255,255,0.15)'
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'orbit-images',
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

					PreviewSelect(node_2, {
						title: 'Shape',
						get value() {
							return $.get(shape);
						},

						options: [
							{ label: 'Ellipse', value: 'ellipse' },
							{ label: 'Circle', value: 'circle' },
							{ label: 'Square', value: 'square' },
							{ label: 'Rectangle', value: 'rectangle' },
							{ label: 'Triangle', value: 'triangle' },
							{ label: 'Star', value: 'star' },
							{ label: 'Heart', value: 'heart' },
							{ label: 'Infinity', value: 'infinity' },
							{ label: 'Wave', value: 'wave' }
						],
						onChange: (v) => $.set(shape, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'Direction',
						get value() {
							return $.get(direction);
						},

						options: [
							{ label: 'Normal', value: 'normal' },
							{ label: 'Reverse', value: 'reverse' }
						],
						onChange: (v) => $.set(direction, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Radius X',
						min: 50,
						max: 600,
						step: 10,
						get value() {
							return $.get(radiusX);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(radiusX, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Radius Y',
						min: 50,
						max: 600,
						step: 10,
						get value() {
							return $.get(radiusY);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(radiusY, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Radius',
						min: 50,
						max: 600,
						step: 10,
						get value() {
							return $.get(radius);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(radius, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotation);
						},
						valueUnit: '°',
						onChange: (v) => $.set(rotation, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Duration',
						min: 5,
						max: 120,
						step: 5,
						get value() {
							return $.get(duration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(duration, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Item Size',
						min: 20,
						max: 120,
						step: 4,
						get value() {
							return $.get(itemSize);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(itemSize, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Fill',
						get checked() {
							return $.get(fill);
						},
						onChange: (v) => $.set(fill, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Show Path',
						get checked() {
							return $.get(showPath);
						},
						onChange: (v) => $.set(showPath, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Paused',
						get checked() {
							return $.get(paused);
						},
						onChange: (v) => $.set(paused, v, true)
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
			componentName: 'OrbitImages',
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