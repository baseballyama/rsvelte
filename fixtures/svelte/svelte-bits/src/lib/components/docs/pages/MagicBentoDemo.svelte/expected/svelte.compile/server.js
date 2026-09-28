import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MagicBento from '$lib/components/library/Components/MagicBento/MagicBento.svelte';
import source from '$lib/components/library/Components/MagicBento/MagicBento.svelte?raw';

export default function MagicBentoDemo($$renderer) {
	const DEFAULTS = {
		enableStars: true,
		enableSpotlight: true,
		disableAnimations: false,
		spotlightRadius: 400,
		enableTilt: false,
		clickEffect: true,
		enableMagnetism: false
	};

	let enableStars = DEFAULTS.enableStars;
	let enableSpotlight = DEFAULTS.enableSpotlight;
	let disableAnimations = DEFAULTS.disableAnimations;
	let spotlightRadius = DEFAULTS.spotlightRadius;
	let enableTilt = DEFAULTS.enableTilt;
	let clickEffect = DEFAULTS.clickEffect;
	let enableMagnetism = DEFAULTS.enableMagnetism;
	let key = 0;
	const hasChanges = $.derived(() => enableStars !== DEFAULTS.enableStars || enableSpotlight !== DEFAULTS.enableSpotlight || disableAnimations !== DEFAULTS.disableAnimations || spotlightRadius !== DEFAULTS.spotlightRadius || enableTilt !== DEFAULTS.enableTilt || clickEffect !== DEFAULTS.clickEffect || enableMagnetism !== DEFAULTS.enableMagnetism);

	function reset() {
		enableStars = DEFAULTS.enableStars;
		enableSpotlight = DEFAULTS.enableSpotlight;
		disableAnimations = DEFAULTS.disableAnimations;
		spotlightRadius = DEFAULTS.spotlightRadius;
		enableTilt = DEFAULTS.enableTilt;
		clickEffect = DEFAULTS.clickEffect;
		enableMagnetism = DEFAULTS.enableMagnetism;
		key++;
	}

	const usage = `<MagicBento enableStars enableSpotlight enableBorderGlow />`;

	const props = [
		{
			name: 'textAutoHide',
			type: 'boolean',
			default: 'true',
			description: 'Clamp long text in cards.'
		},

		{
			name: 'enableStars',
			type: 'boolean',
			default: 'true',
			description: 'Particle star animation on hover.'
		},

		{
			name: 'enableSpotlight',
			type: 'boolean',
			default: 'true',
			description: 'Cursor-following spotlight.'
		},

		{
			name: 'enableBorderGlow',
			type: 'boolean',
			default: 'true',
			description: 'Cursor-following border glow.'
		},

		{
			name: 'disableAnimations',
			type: 'boolean',
			default: 'false',
			description: 'Force-disable animations.'
		},

		{
			name: 'spotlightRadius',
			type: 'number',
			default: '300',
			description: 'Spotlight radius in pixels.'
		},

		{
			name: 'particleCount',
			type: 'number',
			default: '12',
			description: 'Particle count per card.'
		},

		{
			name: 'enableTilt',
			type: 'boolean',
			default: 'false',
			description: '3D tilt on hover.'
		},

		{
			name: 'glowColor',
			type: 'string',
			default: '"255, 138, 76"',
			description: 'RGB triplet for glow effects.'
		},

		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'true',
			description: 'Ripple on click.'
		},

		{
			name: 'enableMagnetism',
			type: 'boolean',
			default: 'true',
			description: 'Card attracts to cursor.'
		}
	];

	$.head('1imgdgn', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Magic Bento - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Magic Bento</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;padding:2rem 0;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!---->`);

			{
				MagicBento($$renderer, {
					enableStars,
					enableSpotlight,
					disableAnimations,
					spotlightRadius,
					enableTilt,
					clickEffect,
					enableMagnetism
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'magic-bento', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Spotlight Radius',
						min: 50,
						max: 800,
						step: 10,
						value: spotlightRadius,
						onChange: (v) => spotlightRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Stars Effect',
						checked: enableStars,
						onChange: (v) => enableStars = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Spotlight Effect',
						checked: enableSpotlight,
						onChange: (v) => enableSpotlight = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Tilt Effect',
						checked: enableTilt,
						onChange: (v) => enableTilt = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Click Effect',
						checked: clickEffect,
						onChange: (v) => clickEffect = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Magnetism',
						checked: enableMagnetism,
						onChange: (v) => enableMagnetism = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Disable All Animations',
						checked: disableAnimations,
						onChange: (v) => disableAnimations = v
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
			componentName: 'MagicBento',
			usage,
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