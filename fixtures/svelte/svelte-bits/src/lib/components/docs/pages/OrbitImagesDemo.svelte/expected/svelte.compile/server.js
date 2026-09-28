import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import OrbitImages from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte';
import source from '$lib/components/library/Animations/OrbitImages/OrbitImages.svelte?raw';

export default function OrbitImagesDemo($$renderer) {
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

	let shape = DEFAULTS.shape;
	let radiusX = DEFAULTS.radiusX;
	let radiusY = DEFAULTS.radiusY;
	let radius = DEFAULTS.radius;
	let rotation = DEFAULTS.rotation;
	let duration = DEFAULTS.duration;
	let itemSize = DEFAULTS.itemSize;
	let direction = DEFAULTS.direction;
	let fill = DEFAULTS.fill;
	let showPath = DEFAULTS.showPath;
	let paused = DEFAULTS.paused;
	const hasChanges = $.derived(() => shape !== DEFAULTS.shape || radiusX !== DEFAULTS.radiusX || radiusY !== DEFAULTS.radiusY || radius !== DEFAULTS.radius || rotation !== DEFAULTS.rotation || duration !== DEFAULTS.duration || itemSize !== DEFAULTS.itemSize || direction !== DEFAULTS.direction || fill !== DEFAULTS.fill || showPath !== DEFAULTS.showPath || paused !== DEFAULTS.paused);

	function reset() {
		shape = DEFAULTS.shape;
		radiusX = DEFAULTS.radiusX;
		radiusY = DEFAULTS.radiusY;
		radius = DEFAULTS.radius;
		rotation = DEFAULTS.rotation;
		duration = DEFAULTS.duration;
		itemSize = DEFAULTS.itemSize;
		direction = DEFAULTS.direction;
		fill = DEFAULTS.fill;
		showPath = DEFAULTS.showPath;
		paused = DEFAULTS.paused;
	}

	const usage = $.derived(() => `<OrbitImages images={images} shape="${shape}" radiusX={${radiusX}} radiusY={${radiusY}} radius={${radius}} rotation={${rotation}} duration={${duration}} itemSize={${itemSize}} direction="${direction}" fill={${fill}} showPath={${showPath}} paused={${paused}} responsive />`);

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

	$.head('1mnrm7q', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Orbit Images - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Orbit Images</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;">`);

			OrbitImages($$renderer, {
				images,
				shape,
				radiusX,
				radiusY,
				radius,
				rotation,
				duration,
				itemSize,
				direction,
				fill,
				showPath,
				paused,
				responsive: true,
				pathColor: 'rgba(255,255,255,0.15)'
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'orbit-images', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Shape',
						value: shape,
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
						onChange: (v) => shape = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						value: direction,
						options: [
							{ label: 'Normal', value: 'normal' },
							{ label: 'Reverse', value: 'reverse' }
						],
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius X',
						min: 50,
						max: 600,
						step: 10,
						value: radiusX,
						valueUnit: 'px',
						onChange: (v) => radiusX = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius Y',
						min: 50,
						max: 600,
						step: 10,
						value: radiusY,
						valueUnit: 'px',
						onChange: (v) => radiusY = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 50,
						max: 600,
						step: 10,
						value: radius,
						valueUnit: 'px',
						onChange: (v) => radius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						value: rotation,
						valueUnit: '°',
						onChange: (v) => rotation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 5,
						max: 120,
						step: 5,
						value: duration,
						valueUnit: 's',
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Item Size',
						min: 20,
						max: 120,
						step: 4,
						value: itemSize,
						valueUnit: 'px',
						onChange: (v) => itemSize = v
					});

					$$renderer.push(`<!----> `);
					PreviewSwitch($$renderer, { title: 'Fill', checked: fill, onChange: (v) => fill = v });
					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Show Path',
						checked: showPath,
						onChange: (v) => showPath = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Paused',
						checked: paused,
						onChange: (v) => paused = v
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'OrbitImages',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}