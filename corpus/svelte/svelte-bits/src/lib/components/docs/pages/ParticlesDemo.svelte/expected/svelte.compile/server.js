import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Particles from '$lib/components/library/Backgrounds/Particles/Particles.svelte';
import source from '$lib/components/library/Backgrounds/Particles/Particles.svelte?raw';

export default function ParticlesDemo($$renderer) {
	const D = {
		particleCount: 200,
		particleSpread: 10,
		speed: 0.1,
		moveParticlesOnHover: false,
		particleHoverFactor: 1,
		alphaParticles: false,
		particleBaseSize: 100,
		sizeRandomness: 1,
		cameraDistance: 20,
		disableRotation: false
	};

	let particleCount = D.particleCount;
	let particleSpread = D.particleSpread;
	let speed = D.speed;
	let moveParticlesOnHover = D.moveParticlesOnHover;
	let particleHoverFactor = D.particleHoverFactor;
	let alphaParticles = D.alphaParticles;
	let particleBaseSize = D.particleBaseSize;
	let sizeRandomness = D.sizeRandomness;
	let cameraDistance = D.cameraDistance;
	let disableRotation = D.disableRotation;
	let showContent = true;
	let key = 0;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => particleCount !== D.particleCount || particleSpread !== D.particleSpread || speed !== D.speed || moveParticlesOnHover !== D.moveParticlesOnHover || particleHoverFactor !== D.particleHoverFactor || alphaParticles !== D.alphaParticles || particleBaseSize !== D.particleBaseSize || sizeRandomness !== D.sizeRandomness || cameraDistance !== D.cameraDistance || disableRotation !== D.disableRotation);

	function reset() {
		particleCount = D.particleCount;
		particleSpread = D.particleSpread;
		speed = D.speed;
		moveParticlesOnHover = D.moveParticlesOnHover;
		particleHoverFactor = D.particleHoverFactor;
		alphaParticles = D.alphaParticles;
		particleBaseSize = D.particleBaseSize;
		sizeRandomness = D.sizeRandomness;
		cameraDistance = D.cameraDistance;
		disableRotation = D.disableRotation;
		key++;
	}

	const usage = $.derived(() => `${sO}
  import Particles from '$lib/components/Particles.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Particles particleCount={${particleCount}} speed={${speed}} />
</div>`);

	const props = [
		{
			name: 'particleCount',
			type: 'number',
			default: '200',
			description: 'Number of particles.'
		},

		{
			name: 'particleSpread',
			type: 'number',
			default: '10',
			description: 'Distribution spread.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.1',
			description: 'Animation speed.'
		},

		{
			name: 'particleColors',
			type: 'string[]',
			default: 'undefined',
			description: 'Hex palette.'
		},

		{
			name: 'moveParticlesOnHover',
			type: 'boolean',
			default: 'false',
			description: 'React to hover.'
		},

		{
			name: 'particleHoverFactor',
			type: 'number',
			default: '1',
			description: 'Hover offset factor.'
		},

		{
			name: 'alphaParticles',
			type: 'boolean',
			default: 'false',
			description: 'Soft alpha edges.'
		},

		{
			name: 'particleBaseSize',
			type: 'number',
			default: '100',
			description: 'Base size in px.'
		},

		{
			name: 'sizeRandomness',
			type: 'number',
			default: '1',
			description: 'Size variance.'
		},

		{
			name: 'cameraDistance',
			type: 'number',
			default: '20',
			description: 'Camera distance.'
		},

		{
			name: 'disableRotation',
			type: 'boolean',
			default: 'false',
			description: 'Disable rotation.'
		}
	];

	$.head('bfegkx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Particles - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Particles</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!---->`);

			{
				Particles($$renderer, {
					particleCount,
					particleSpread,
					speed,
					moveParticlesOnHover,
					particleHoverFactor,
					alphaParticles,
					particleBaseSize,
					sizeRandomness,
					cameraDistance,
					disableRotation
				});
			}

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'particles', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Particle Count',
						min: 10,
						max: 1000,
						step: 10,
						value: particleCount,
						onChange: (v) => particleCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Spread',
						min: 1,
						max: 50,
						step: 1,
						value: particleSpread,
						onChange: (v) => particleSpread = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Size',
						min: 10,
						max: 400,
						step: 5,
						value: particleBaseSize,
						onChange: (v) => particleBaseSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Size Randomness',
						min: 0,
						max: 3,
						step: 0.05,
						value: sizeRandomness,
						onChange: (v) => sizeRandomness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Camera Distance',
						min: 5,
						max: 60,
						step: 1,
						value: cameraDistance,
						onChange: (v) => cameraDistance = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Alpha Particles',
						checked: alphaParticles,
						onChange: (v) => alphaParticles = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Move on Hover',
						checked: moveParticlesOnHover,
						onChange: (v) => moveParticlesOnHover = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Factor',
						min: 0,
						max: 5,
						step: 0.05,
						value: particleHoverFactor,
						onChange: (v) => particleHoverFactor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Disable Rotation',
						checked: disableRotation,
						onChange: (v) => disableRotation = v
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
			componentName: 'Particles',
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