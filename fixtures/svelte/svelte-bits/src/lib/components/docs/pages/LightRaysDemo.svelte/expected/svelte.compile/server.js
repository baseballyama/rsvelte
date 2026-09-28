import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LightRays from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte';
import source from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte?raw';

export default function LightRaysDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const D = {
			raysOrigin: 'top-center',
			raysColor: '#ffffff',
			raysSpeed: 1,
			lightSpread: 1,
			rayLength: 2,
			pulsating: false,
			fadeDistance: 1,
			saturation: 1,
			followMouse: true,
			mouseInfluence: 0.1,
			noiseAmount: 0,
			distortion: 0
		};

		let raysOrigin = D.raysOrigin;
		let raysColor = D.raysColor;
		let raysSpeed = D.raysSpeed;
		let lightSpread = D.lightSpread;
		let rayLength = D.rayLength;
		let pulsating = D.pulsating;
		let fadeDistance = D.fadeDistance;
		let saturation = D.saturation;
		let followMouse = D.followMouse;
		let mouseInfluence = D.mouseInfluence;
		let noiseAmount = D.noiseAmount;
		let distortion = D.distortion;
		let showContent = true;
		const sO = '<' + 'script lang="ts">';
		const sC = '</' + 'script>';
		const hasChanges = $.derived(() => raysOrigin !== D.raysOrigin || raysColor !== D.raysColor || raysSpeed !== D.raysSpeed || lightSpread !== D.lightSpread || rayLength !== D.rayLength || pulsating !== D.pulsating || fadeDistance !== D.fadeDistance || saturation !== D.saturation || followMouse !== D.followMouse || mouseInfluence !== D.mouseInfluence || noiseAmount !== D.noiseAmount || distortion !== D.distortion);

		function reset() {
			raysOrigin = D.raysOrigin;
			raysColor = D.raysColor;
			raysSpeed = D.raysSpeed;
			lightSpread = D.lightSpread;
			rayLength = D.rayLength;
			pulsating = D.pulsating;
			fadeDistance = D.fadeDistance;
			saturation = D.saturation;
			followMouse = D.followMouse;
			mouseInfluence = D.mouseInfluence;
			noiseAmount = D.noiseAmount;
			distortion = D.distortion;
		}

		const usage = $.derived(() => `${sO}
  import LightRays from '$lib/components/LightRays.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LightRays raysOrigin="${raysOrigin}" raysColor="${raysColor}" raysSpeed={${raysSpeed}} />
</div>`);

		const props = [
			{
				name: 'raysOrigin',
				type: '"top-center" | "top-left" | …',
				default: '"top-center"',
				description: 'Ray emission anchor.'
			},

			{
				name: 'raysColor',
				type: 'string',
				default: '"#ffffff"',
				description: 'Hex tint of the rays.'
			},

			{
				name: 'raysSpeed',
				type: 'number',
				default: '1',
				description: 'Animation speed.'
			},

			{
				name: 'lightSpread',
				type: 'number',
				default: '1',
				description: 'Spread tightness.'
			},

			{
				name: 'rayLength',
				type: 'number',
				default: '2',
				description: 'Ray length multiplier.'
			},

			{
				name: 'pulsating',
				type: 'boolean',
				default: 'false',
				description: 'Pulsating intensity.'
			},

			{
				name: 'fadeDistance',
				type: 'number',
				default: '1',
				description: 'Fade distance.'
			},

			{
				name: 'saturation',
				type: 'number',
				default: '1',
				description: 'Color saturation.'
			},

			{
				name: 'followMouse',
				type: 'boolean',
				default: 'true',
				description: 'Follow mouse.'
			},

			{
				name: 'mouseInfluence',
				type: 'number',
				default: '0.1',
				description: 'Mouse influence amount.'
			},

			{
				name: 'noiseAmount',
				type: 'number',
				default: '0',
				description: 'Noise grain amount.'
			},

			{
				name: 'distortion',
				type: 'number',
				default: '0',
				description: 'Distortion amount.'
			}
		];

		const originOptions = [
			'top-center',
			'top-left',
			'top-right',
			'left',
			'right',
			'bottom-center',
			'bottom-left',
			'bottom-right'
		].map((o) => ({ label: o, value: o }));

		$.head('14yaxrb', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Light Rays - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<h1 class="sub-category">Light Rays</h1> `);

		{
			function preview($$renderer) {
				$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

				LightRays($$renderer, {
					raysOrigin,
					raysColor,
					raysSpeed,
					lightSpread,
					rayLength,
					pulsating,
					fadeDistance,
					saturation,
					followMouse,
					mouseInfluence,
					noiseAmount,
					distortion
				});

				$$renderer.push(`<!----> `);
				BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
				$$renderer.push(`<!----></div>`);
			}

			function code($$renderer) {
				DemoCodeTab($$renderer, { slug: 'light-rays', usage: usage(), source });
			}

			function customize($$renderer) {
				Customize($$renderer, {
					children: ($$renderer) => {
						PreviewSelect($$renderer, {
							title: 'Rays Origin',
							value: raysOrigin,
							options: originOptions,
							onChange: (v) => raysOrigin = v
						});

						$$renderer.push(`<!----> `);

						PreviewColorPicker($$renderer, {
							title: 'Rays Color',
							value: raysColor,
							onChange: (v) => raysColor = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Speed',
							min: 0,
							max: 5,
							step: 0.1,
							value: raysSpeed,
							onChange: (v) => raysSpeed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Spread',
							min: 0.1,
							max: 3,
							step: 0.05,
							value: lightSpread,
							onChange: (v) => lightSpread = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Ray Length',
							min: 0.5,
							max: 5,
							step: 0.05,
							value: rayLength,
							onChange: (v) => rayLength = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Pulsating',
							checked: pulsating,
							onChange: (v) => pulsating = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Fade Distance',
							min: 0.1,
							max: 3,
							step: 0.05,
							value: fadeDistance,
							onChange: (v) => fadeDistance = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Saturation',
							min: 0,
							max: 2,
							step: 0.05,
							value: saturation,
							onChange: (v) => saturation = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Follow Mouse',
							checked: followMouse,
							onChange: (v) => followMouse = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Mouse Influence',
							min: 0,
							max: 1,
							step: 0.05,
							value: mouseInfluence,
							onChange: (v) => mouseInfluence = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Noise',
							min: 0,
							max: 1,
							step: 0.01,
							value: noiseAmount,
							onChange: (v) => noiseAmount = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Distortion',
							min: 0,
							max: 1,
							step: 0.01,
							value: distortion,
							onChange: (v) => distortion = v
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
				componentName: 'LightRays',
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