import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Iridescence from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte';
import source from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte?raw';

export default function IridescenceDemo($$renderer) {
	const DEFAULTS = {
		speed: 1.0,
		amplitude: 0.1,
		mouseReact: true,
		r: 1,
		g: 1,
		b: 1
	};

	let speed = DEFAULTS.speed;
	let amplitude = DEFAULTS.amplitude;
	let mouseReact = DEFAULTS.mouseReact;
	let r = DEFAULTS.r;
	let g = DEFAULTS.g;
	let b = DEFAULTS.b;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const color = $.derived(() => [r, g, b]);
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || amplitude !== DEFAULTS.amplitude || mouseReact !== DEFAULTS.mouseReact || r !== DEFAULTS.r || g !== DEFAULTS.g || b !== DEFAULTS.b);

	function reset() {
		speed = DEFAULTS.speed;
		amplitude = DEFAULTS.amplitude;
		mouseReact = DEFAULTS.mouseReact;
		r = DEFAULTS.r;
		g = DEFAULTS.g;
		b = DEFAULTS.b;
	}

	const usage = $.derived(() => `${scriptOpen}
  import Iridescence from '$lib/components/Iridescence.svelte';
${scriptClose}

<div style="height: 600px; position: relative;">
  <Iridescence
    color={[${r}, ${g}, ${b}]}
    mouseReact={${mouseReact}}
    amplitude={${amplitude}}
    speed={${speed}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: '[number, number, number]',
			default: '[1, 1, 1]',
			description: 'RGB color tint (0–1).'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1.0',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '0.1',
			description: 'Mouse parallax amplitude.'
		},

		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'Whether the effect reacts to the mouse.'
		}
	];

	$.head('1e7ayp8', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Iridescence - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Iridescence</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
			Iridescence($$renderer, { color: color(), speed, amplitude, mouseReact });
			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'iridescence', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Red',
						min: 0,
						max: 1,
						step: 0.01,
						value: r,
						onChange: (v) => r = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Green',
						min: 0,
						max: 1,
						step: 0.01,
						value: g,
						onChange: (v) => g = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blue',
						min: 0,
						max: 1,
						step: 0.01,
						value: b,
						onChange: (v) => b = v
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
						title: 'Amplitude',
						min: 0,
						max: 1,
						step: 0.01,
						value: amplitude,
						onChange: (v) => amplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse React',
						checked: mouseReact,
						onChange: (v) => mouseReact = v
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
			componentName: 'Iridescence',
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