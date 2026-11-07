import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Plasma from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte';
import source from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte?raw';

export default function PlasmaDemo($$renderer) {
	const DEFAULTS = {
		color: '#ff3e00',
		speed: 1,
		direction: 'forward',
		scale: 1,
		opacity: 1,
		mouseInteractive: true
	};

	let color = DEFAULTS.color;
	let speed = DEFAULTS.speed;
	let direction = DEFAULTS.direction;
	let scale = DEFAULTS.scale;
	let opacity = DEFAULTS.opacity;
	let mouseInteractive = DEFAULTS.mouseInteractive;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => color !== DEFAULTS.color || speed !== DEFAULTS.speed || direction !== DEFAULTS.direction || scale !== DEFAULTS.scale || opacity !== DEFAULTS.opacity || mouseInteractive !== DEFAULTS.mouseInteractive);

	function reset() {
		color = DEFAULTS.color;
		speed = DEFAULTS.speed;
		direction = DEFAULTS.direction;
		scale = DEFAULTS.scale;
		opacity = DEFAULTS.opacity;
		mouseInteractive = DEFAULTS.mouseInteractive;
	}

	const usage = $.derived(() => `${scriptOpen}
  import Plasma from '$lib/components/Plasma.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Plasma
    color="${color}"
    speed={${speed}}
    direction="${direction}"
    scale={${scale}}
    opacity={${opacity}}
    mouseInteractive={${mouseInteractive}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Tint color for the plasma.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'direction',
			type: '"forward" | "reverse" | "pingpong"',
			default: '"forward"',
			description: 'Time direction.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Pattern scale.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Final opacity.'
		},

		{
			name: 'mouseInteractive',
			type: 'boolean',
			default: 'true',
			description: 'Mouse parallax.'
		}
	];

	$.head('857jps', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Plasma - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Plasma</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
			Plasma($$renderer, { color, speed, direction, scale, opacity, mouseInteractive });
			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'plasma', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: [
							{ value: 'forward', label: 'Forward' },
							{ value: 'reverse', label: 'Reverse' },
							{ value: 'pingpong', label: 'Pingpong' }
						],
						value: direction,
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.5,
						max: 3,
						step: 0.05,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: opacity,
						onChange: (v) => opacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Interactive',
						checked: mouseInteractive,
						onChange: (v) => mouseInteractive = v
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
			componentName: 'Plasma',
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