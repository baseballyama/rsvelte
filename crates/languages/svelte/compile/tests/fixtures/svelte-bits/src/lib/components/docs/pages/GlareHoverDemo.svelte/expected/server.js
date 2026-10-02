import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlareHover from '$lib/components/library/Animations/GlareHover/GlareHover.svelte';
import source from '$lib/components/library/Animations/GlareHover/GlareHover.svelte?raw';

export default function GlareHoverDemo($$renderer) {
	const DEFAULTS = {
		glareColor: '#FF8A4C',
		glareOpacity: 0.5,
		glareSize: 300,
		transitionDuration: 800,
		playOnce: false
	};

	let glareColor = DEFAULTS.glareColor;
	let glareOpacity = DEFAULTS.glareOpacity;
	let glareSize = DEFAULTS.glareSize;
	let transitionDuration = DEFAULTS.transitionDuration;
	let playOnce = DEFAULTS.playOnce;
	const hasChanges = $.derived(() => glareColor !== DEFAULTS.glareColor || glareOpacity !== DEFAULTS.glareOpacity || glareSize !== DEFAULTS.glareSize || transitionDuration !== DEFAULTS.transitionDuration || playOnce !== DEFAULTS.playOnce);

	function reset() {
		glareColor = DEFAULTS.glareColor;
		glareOpacity = DEFAULTS.glareOpacity;
		glareSize = DEFAULTS.glareSize;
		transitionDuration = DEFAULTS.transitionDuration;
		playOnce = DEFAULTS.playOnce;
	}

	const usage = $.derived(() => `<GlareHover glareColor="${glareColor}" glareOpacity={${glareOpacity}} glareSize={${glareSize}} transitionDuration={${transitionDuration}} playOnce={${playOnce}}>
  <h2>Hover me!</h2>
</GlareHover>`);

	const props = [
		{
			name: 'width',
			type: 'string',
			default: '"500px"',
			description: 'Width of the hover element.'
		},

		{
			name: 'height',
			type: 'string',
			default: '"500px"',
			description: 'Height of the hover element.'
		},

		{
			name: 'background',
			type: 'string',
			default: '"#000"',
			description: 'Background color of the element.'
		},

		{
			name: 'borderRadius',
			type: 'string',
			default: '"10px"',
			description: 'Border radius.'
		},

		{
			name: 'borderColor',
			type: 'string',
			default: '"#333"',
			description: 'Border color.'
		},

		{
			name: 'glareColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Color of the glare.'
		},

		{
			name: 'glareOpacity',
			type: 'number',
			default: '0.5',
			description: 'Opacity of the glare (0-1).'
		},

		{
			name: 'glareAngle',
			type: 'number',
			default: '-45',
			description: 'Angle of the glare (degrees).'
		},

		{
			name: 'glareSize',
			type: 'number',
			default: '250',
			description: 'Size of the glare effect (%).'
		},

		{
			name: 'transitionDuration',
			type: 'number',
			default: '650',
			description: 'Duration of the transition (ms).'
		},

		{
			name: 'playOnce',
			type: 'boolean',
			default: 'false',
			description: 'Whether the animation plays only once.'
		}
	];

	$.head('1ixde8h', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Glare Hover - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Glare Hover</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;">`);

			GlareHover($$renderer, {
				width: '500px',
				height: '300px',
				background: '#1a1a1a',
				borderRadius: '10px',
				borderColor: '#333',
				glareColor,
				glareOpacity,
				glareSize,
				transitionDuration,
				playOnce,
				children: ($$renderer) => {
					$$renderer.push(`<h2 style="font-size:3rem;font-weight:900;color:#fff;margin:0;">Hover me!</h2>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'glare-hover', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Glare Color',
						value: glareColor,
						onChange: (v) => glareColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glare Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: glareOpacity,
						onChange: (v) => glareOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Glare Size',
						min: 50,
						max: 500,
						step: 10,
						value: glareSize,
						onChange: (v) => glareSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Transition Duration',
						min: 100,
						max: 2000,
						step: 50,
						value: transitionDuration,
						valueUnit: 'ms',
						onChange: (v) => transitionDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Play Once',
						checked: playOnce,
						onChange: (v) => playOnce = v
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
			componentName: 'GlareHover',
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