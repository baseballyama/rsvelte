import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Cubes from '$lib/components/library/Animations/Cubes/Cubes.svelte';
import source from '$lib/components/library/Animations/Cubes/Cubes.svelte?raw';

export default function CubesDemo($$renderer) {
	const DEFAULTS = {
		borderStyle: '2px dashed #FF8A4C',
		gridSize: 8,
		maxAngle: 45,
		radius: 3,
		autoAnimate: true,
		rippleOnClick: true
	};

	let borderStyle = DEFAULTS.borderStyle;
	let gridSize = DEFAULTS.gridSize;
	let maxAngle = DEFAULTS.maxAngle;
	let radius = DEFAULTS.radius;
	let autoAnimate = DEFAULTS.autoAnimate;
	let rippleOnClick = DEFAULTS.rippleOnClick;
	const hasChanges = $.derived(() => borderStyle !== DEFAULTS.borderStyle || gridSize !== DEFAULTS.gridSize || maxAngle !== DEFAULTS.maxAngle || radius !== DEFAULTS.radius || autoAnimate !== DEFAULTS.autoAnimate || rippleOnClick !== DEFAULTS.rippleOnClick);

	function reset() {
		borderStyle = DEFAULTS.borderStyle;
		gridSize = DEFAULTS.gridSize;
		maxAngle = DEFAULTS.maxAngle;
		radius = DEFAULTS.radius;
		autoAnimate = DEFAULTS.autoAnimate;
		rippleOnClick = DEFAULTS.rippleOnClick;
	}

	const usage = $.derived(() => `<Cubes gridSize={${gridSize}} maxAngle={${maxAngle}} radius={${radius}} borderStyle="${borderStyle}" autoAnimate={${autoAnimate}} rippleOnClick={${rippleOnClick}} />`);

	const props = [
		{
			name: 'gridSize',
			type: 'number',
			default: '10',
			description: 'The size of the grid (cubes per row/column).'
		},

		{
			name: 'cubeSize',
			type: 'number',
			default: 'undefined',
			description: 'Fixed cube size in px. If undefined, cubes are responsive.'
		},

		{
			name: 'maxAngle',
			type: 'number',
			default: '45',
			description: 'Max rotation angle for the tilt effect.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '3',
			description: 'Mouse hover radius in cube units.'
		},

		{
			name: 'borderStyle',
			type: 'string',
			default: '"2px dashed #B497CF"',
			description: 'CSS border applied to each cube face.'
		},

		{
			name: 'faceColor',
			type: 'string',
			default: '"#060010"',
			description: 'Background color of each cube face.'
		},

		{
			name: 'rippleColor',
			type: 'string',
			default: '"#fff"',
			description: 'Ripple highlight color on click.'
		},

		{
			name: 'rippleSpeed',
			type: 'number',
			default: '1.5',
			description: 'Speed multiplier of the ripple animation.'
		},

		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'true',
			description: 'Whether the cubes auto-orbit when idle.'
		},

		{
			name: 'rippleOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Trigger a ripple wave when clicking a cube.'
		}
	];

	$.head('1ihv5aa', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Cubes - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Cubes</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;">`);

			Cubes($$renderer, {
				gridSize,
				maxAngle,
				radius,
				borderStyle,
				autoAnimate,
				rippleOnClick
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'cubes', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Border Style',
						value: borderStyle,
						options: [
							{ label: 'Dashed Orange', value: '2px dashed #FF8A4C' },
							{ label: 'Dotted White', value: '2px dotted #fff' },
							{ label: 'Solid White', value: '3px solid #fff' }
						],
						onChange: (v) => borderStyle = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Size',
						min: 3,
						max: 15,
						step: 1,
						value: gridSize,
						onChange: (v) => gridSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Angle',
						min: 10,
						max: 90,
						step: 5,
						value: maxAngle,
						valueUnit: '°',
						onChange: (v) => maxAngle = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 1,
						max: 6,
						step: 1,
						value: radius,
						onChange: (v) => radius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Auto Animate',
						checked: autoAnimate,
						onChange: (v) => autoAnimate = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Ripple On Click',
						checked: rippleOnClick,
						onChange: (v) => rippleOnClick = v
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
			componentName: 'Cubes',
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