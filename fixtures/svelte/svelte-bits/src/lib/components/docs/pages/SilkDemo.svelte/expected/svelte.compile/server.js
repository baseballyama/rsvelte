import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Silk from '$lib/components/library/Backgrounds/Silk/Silk.svelte';
import source from '$lib/components/library/Backgrounds/Silk/Silk.svelte?raw';

export default function SilkDemo($$renderer) {
	const DEFAULTS = {
		speed: 5,
		scale: 1,
		color: '#FF8A4C',
		noiseIntensity: 1.5,
		rotation: 0
	};

	let speed = DEFAULTS.speed;
	let scale = DEFAULTS.scale;
	let color = DEFAULTS.color;
	let noiseIntensity = DEFAULTS.noiseIntensity;
	let rotation = DEFAULTS.rotation;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || scale !== DEFAULTS.scale || color !== DEFAULTS.color || noiseIntensity !== DEFAULTS.noiseIntensity || rotation !== DEFAULTS.rotation);

	function reset() {
		speed = DEFAULTS.speed;
		scale = DEFAULTS.scale;
		color = DEFAULTS.color;
		noiseIntensity = DEFAULTS.noiseIntensity;
		rotation = DEFAULTS.rotation;
	}

	const usage = $.derived(() => `${scriptOpen}
  import Silk from '$lib/components/Silk.svelte';
${scriptClose}

<Silk
  speed={${speed}}
  scale={${scale}}
  color="${color}"
  noiseIntensity={${noiseIntensity}}
  rotation={${rotation}}
/>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '5',
			description: 'Speed of the silk waves.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'UV scale of the pattern.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#7B7481"',
			description: 'Tint color.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '1.5',
			description: 'Strength of the grain noise.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Rotation in radians.'
		}
	];

	$.head('1favr1j', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Silk - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Silk</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
			Silk($$renderer, { speed, scale, color, noiseIntensity, rotation });
			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'silk', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 20,
						step: 0.1,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise Intensity',
						min: 0,
						max: 5,
						step: 0.05,
						value: noiseIntensity,
						onChange: (v) => noiseIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation',
						min: 0,
						max: 6.28,
						step: 0.05,
						value: rotation,
						onChange: (v) => rotation = v
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
			componentName: 'Silk',
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