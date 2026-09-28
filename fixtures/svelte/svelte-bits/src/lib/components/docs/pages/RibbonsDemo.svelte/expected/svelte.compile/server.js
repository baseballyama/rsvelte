import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Ribbons from '$lib/components/library/Animations/Ribbons/Ribbons.svelte';
import source from '$lib/components/library/Animations/Ribbons/Ribbons.svelte?raw';

export default function RibbonsDemo($$renderer) {
	const DEFAULTS = {
		baseThickness: 30,
		color: '#FF8A4C',
		speedMultiplier: 0.5,
		maxAge: 500,
		enableFade: false,
		enableShaderEffect: false
	};

	let baseThickness = DEFAULTS.baseThickness;
	let color = DEFAULTS.color;
	let speedMultiplier = DEFAULTS.speedMultiplier;
	let maxAge = DEFAULTS.maxAge;
	let enableFade = DEFAULTS.enableFade;
	let enableShaderEffect = DEFAULTS.enableShaderEffect;
	const hasChanges = $.derived(() => baseThickness !== DEFAULTS.baseThickness || color !== DEFAULTS.color || speedMultiplier !== DEFAULTS.speedMultiplier || maxAge !== DEFAULTS.maxAge || enableFade !== DEFAULTS.enableFade || enableShaderEffect !== DEFAULTS.enableShaderEffect);

	function reset() {
		baseThickness = DEFAULTS.baseThickness;
		color = DEFAULTS.color;
		speedMultiplier = DEFAULTS.speedMultiplier;
		maxAge = DEFAULTS.maxAge;
		enableFade = DEFAULTS.enableFade;
		enableShaderEffect = DEFAULTS.enableShaderEffect;
	}

	const colors = $.derived(() => [color]);
	const usage = $.derived(() => `<Ribbons colors={['${color}']} baseThickness={${baseThickness}} speedMultiplier={${speedMultiplier}} maxAge={${maxAge}} enableFade={${enableFade}} enableShaderEffect={${enableShaderEffect}} />`);

	const props = [
		{
			name: 'colors',
			type: 'string[]',
			default: '["#ff9346", ...]',
			description: 'One color per ribbon.'
		},

		{
			name: 'baseSpring',
			type: 'number',
			default: '0.03',
			description: 'Spring stiffness baseline.'
		},

		{
			name: 'baseFriction',
			type: 'number',
			default: '0.9',
			description: 'Spring friction baseline.'
		},

		{
			name: 'baseThickness',
			type: 'number',
			default: '30',
			description: 'Ribbon thickness.'
		},

		{
			name: 'offsetFactor',
			type: 'number',
			default: '0.05',
			description: 'Vertical offset between ribbons.'
		},

		{
			name: 'maxAge',
			type: 'number',
			default: '500',
			description: 'Trail lifetime (ms).'
		},

		{
			name: 'pointCount',
			type: 'number',
			default: '50',
			description: 'Sample points along trail.'
		},

		{
			name: 'speedMultiplier',
			type: 'number',
			default: '0.6',
			description: 'Pointer-velocity multiplier.'
		},

		{
			name: 'enableFade',
			type: 'boolean',
			default: 'false',
			description: 'Fade ribbons by age.'
		},

		{
			name: 'enableShaderEffect',
			type: 'boolean',
			default: 'false',
			description: 'Apply iridescence shader.'
		},

		{
			name: 'effectAmplitude',
			type: 'number',
			default: '2',
			description: 'Shader displacement amplitude.'
		},

		{
			name: 'backgroundColor',
			type: 'number[]',
			default: '[0,0,0,0]',
			description: 'Clear color RGBA.'
		}
	];

	$.head('1sewxv3', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Ribbons - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Ribbons</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;">`);

			Ribbons($$renderer, {
				colors: colors(),
				baseThickness,
				speedMultiplier,
				maxAge,
				enableFade,
				enableShaderEffect
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'ribbons', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Thickness',
						min: 5,
						max: 100,
						step: 1,
						value: baseThickness,
						onChange: (v) => baseThickness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed Multiplier',
						min: 0.1,
						max: 3,
						step: 0.05,
						value: speedMultiplier,
						onChange: (v) => speedMultiplier = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Age',
						min: 100,
						max: 3000,
						step: 50,
						value: maxAge,
						valueUnit: 'ms',
						onChange: (v) => maxAge = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Fade',
						checked: enableFade,
						onChange: (v) => enableFade = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Shader Effect',
						checked: enableShaderEffect,
						onChange: (v) => enableShaderEffect = v
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
			componentName: 'Ribbons',
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