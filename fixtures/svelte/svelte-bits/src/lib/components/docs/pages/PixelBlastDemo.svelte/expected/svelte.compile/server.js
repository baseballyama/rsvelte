import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PixelBlast from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte';
import source from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte?raw';

export default function PixelBlastDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const D = {
			variant: 'square',
			pixelSize: 3,
			color: '#ff8a3d',
			patternScale: 2,
			patternDensity: 1,
			liquid: false,
			liquidStrength: 0.1,
			liquidRadius: 1,
			pixelSizeJitter: 0,
			enableRipples: true,
			rippleIntensityScale: 1,
			rippleThickness: 0.1,
			rippleSpeed: 0.3,
			liquidWobbleSpeed: 4.5,
			speed: 0.5,
			transparent: true,
			edgeFade: 0.5,
			noiseAmount: 0
		};

		let variant = D.variant;
		let pixelSize = D.pixelSize;
		let color = D.color;
		let patternScale = D.patternScale;
		let patternDensity = D.patternDensity;
		let liquid = D.liquid;
		let liquidStrength = D.liquidStrength;
		let liquidRadius = D.liquidRadius;
		let pixelSizeJitter = D.pixelSizeJitter;
		let enableRipples = D.enableRipples;
		let rippleIntensityScale = D.rippleIntensityScale;
		let rippleThickness = D.rippleThickness;
		let rippleSpeed = D.rippleSpeed;
		let liquidWobbleSpeed = D.liquidWobbleSpeed;
		let speed = D.speed;
		let transparent = D.transparent;
		let edgeFade = D.edgeFade;
		let noiseAmount = D.noiseAmount;
		let showContent = true;
		const sO = '<' + 'script lang="ts">';
		const sC = '</' + 'script>';
		const hasChanges = $.derived(() => variant !== D.variant || pixelSize !== D.pixelSize || color !== D.color || patternScale !== D.patternScale || patternDensity !== D.patternDensity || liquid !== D.liquid || liquidStrength !== D.liquidStrength || liquidRadius !== D.liquidRadius || pixelSizeJitter !== D.pixelSizeJitter || enableRipples !== D.enableRipples || rippleIntensityScale !== D.rippleIntensityScale || rippleThickness !== D.rippleThickness || rippleSpeed !== D.rippleSpeed || liquidWobbleSpeed !== D.liquidWobbleSpeed || speed !== D.speed || transparent !== D.transparent || edgeFade !== D.edgeFade || noiseAmount !== D.noiseAmount);

		function reset() {
			variant = D.variant;
			pixelSize = D.pixelSize;
			color = D.color;
			patternScale = D.patternScale;
			patternDensity = D.patternDensity;
			liquid = D.liquid;
			liquidStrength = D.liquidStrength;
			liquidRadius = D.liquidRadius;
			pixelSizeJitter = D.pixelSizeJitter;
			enableRipples = D.enableRipples;
			rippleIntensityScale = D.rippleIntensityScale;
			rippleThickness = D.rippleThickness;
			rippleSpeed = D.rippleSpeed;
			liquidWobbleSpeed = D.liquidWobbleSpeed;
			speed = D.speed;
			transparent = D.transparent;
			edgeFade = D.edgeFade;
			noiseAmount = D.noiseAmount;
		}

		const usage = $.derived(() => `${sO}
  import PixelBlast from '$lib/components/PixelBlast.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PixelBlast variant="${variant}" color="${color}" pixelSize={${pixelSize}} />
</div>`);

		const props = [
			{
				name: 'variant',
				type: "'square'|'circle'|'triangle'|'diamond'",
				default: "'square'",
				description: 'Pixel shape.'
			},

			{
				name: 'pixelSize',
				type: 'number',
				default: '3',
				description: 'Pixel cell size.'
			},

			{
				name: 'color',
				type: 'string',
				default: "'#B497CF'",
				description: 'Color.'
			},

			{
				name: 'antialias',
				type: 'boolean',
				default: 'true',
				description: 'WebGL antialiasing.'
			},

			{
				name: 'patternScale',
				type: 'number',
				default: '2',
				description: 'fbm scale.'
			},

			{
				name: 'patternDensity',
				type: 'number',
				default: '1',
				description: 'Density bias.'
			},

			{
				name: 'liquid',
				type: 'boolean',
				default: 'false',
				description: 'Enable liquid distortion.'
			},

			{
				name: 'liquidStrength',
				type: 'number',
				default: '0.1',
				description: 'Liquid distortion strength.'
			},

			{
				name: 'liquidRadius',
				type: 'number',
				default: '1',
				description: 'Liquid touch radius.'
			},

			{
				name: 'liquidWobbleSpeed',
				type: 'number',
				default: '4.5',
				description: 'Liquid wobble freq.'
			},

			{
				name: 'pixelSizeJitter',
				type: 'number',
				default: '0',
				description: 'Per-cell size jitter.'
			},

			{
				name: 'enableRipples',
				type: 'boolean',
				default: 'true',
				description: 'Click ripple bursts.'
			},

			{
				name: 'rippleIntensityScale',
				type: 'number',
				default: '1',
				description: 'Ripple intensity.'
			},

			{
				name: 'rippleThickness',
				type: 'number',
				default: '0.1',
				description: 'Ripple ring thickness.'
			},

			{
				name: 'rippleSpeed',
				type: 'number',
				default: '0.3',
				description: 'Ripple expansion speed.'
			},

			{
				name: 'autoPauseOffscreen',
				type: 'boolean',
				default: 'true',
				description: 'Pause when offscreen.'
			},

			{
				name: 'speed',
				type: 'number',
				default: '0.5',
				description: 'Animation speed.'
			},

			{
				name: 'transparent',
				type: 'boolean',
				default: 'true',
				description: 'Transparent background.'
			},

			{
				name: 'edgeFade',
				type: 'number',
				default: '0.5',
				description: 'Edge fade amount.'
			},

			{
				name: 'noiseAmount',
				type: 'number',
				default: '0',
				description: 'Postprocess grain.'
			}
		];

		let key = 0;

		$.head('1h9yk0c', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Pixel Blast - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<h1 class="sub-category">Pixel Blast</h1> `);

		{
			function preview($$renderer) {
				$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!---->`);

				{
					PixelBlast($$renderer, {
						variant,
						pixelSize,
						color,
						patternScale,
						patternDensity,
						liquid,
						liquidStrength,
						liquidRadius,
						pixelSizeJitter,
						enableRipples,
						rippleIntensityScale,
						rippleThickness,
						rippleSpeed,
						liquidWobbleSpeed,
						speed,
						transparent,
						edgeFade,
						noiseAmount
					});
				}

				$$renderer.push(`<!----> `);
				BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
				$$renderer.push(`<!----></div>`);
			}

			function code($$renderer) {
				DemoCodeTab($$renderer, { slug: 'pixel-blast', usage: usage(), source });
			}

			function customize($$renderer) {
				Customize($$renderer, {
					children: ($$renderer) => {
						PreviewSelect($$renderer, {
							title: 'Variant',
							value: variant,
							options: [
								{ label: 'Square', value: 'square' },
								{ label: 'Circle', value: 'circle' },
								{ label: 'Triangle', value: 'triangle' },
								{ label: 'Diamond', value: 'diamond' }
							],
							onChange: (v) => variant = v
						});

						$$renderer.push(`<!----> `);
						PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Pixel Size',
							min: 1,
							max: 20,
							step: 1,
							value: pixelSize,
							onChange: (v) => pixelSize = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Pattern Scale',
							min: 0.5,
							max: 10,
							step: 0.1,
							value: patternScale,
							onChange: (v) => patternScale = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Pattern Density',
							min: 0,
							max: 2,
							step: 0.05,
							value: patternDensity,
							onChange: (v) => patternDensity = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Pixel Size Jitter',
							min: 0,
							max: 1,
							step: 0.05,
							value: pixelSizeJitter,
							onChange: (v) => pixelSizeJitter = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Speed',
							min: 0,
							max: 3,
							step: 0.05,
							value: speed,
							onChange: (v) => speed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Edge Fade',
							min: 0,
							max: 1,
							step: 0.05,
							value: edgeFade,
							onChange: (v) => edgeFade = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Liquid',
							checked: liquid,
							onChange: (v) => liquid = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Liquid Strength',
							min: 0,
							max: 1,
							step: 0.01,
							value: liquidStrength,
							onChange: (v) => liquidStrength = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Liquid Radius',
							min: 0.1,
							max: 3,
							step: 0.05,
							value: liquidRadius,
							onChange: (v) => liquidRadius = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Wobble Speed',
							min: 0,
							max: 10,
							step: 0.1,
							value: liquidWobbleSpeed,
							onChange: (v) => liquidWobbleSpeed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Enable Ripples',
							checked: enableRipples,
							onChange: (v) => enableRipples = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Ripple Intensity',
							min: 0,
							max: 3,
							step: 0.05,
							value: rippleIntensityScale,
							onChange: (v) => rippleIntensityScale = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Ripple Thickness',
							min: 0.01,
							max: 0.5,
							step: 0.01,
							value: rippleThickness,
							onChange: (v) => rippleThickness = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Ripple Speed',
							min: 0,
							max: 2,
							step: 0.05,
							value: rippleSpeed,
							onChange: (v) => rippleSpeed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Transparent',
							checked: transparent,
							onChange: (v) => transparent = v
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
				onreset: () => {
					reset();
					key++;
				},
				hasChanges: hasChanges(),
				componentName: 'PixelBlast',
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
	});
}