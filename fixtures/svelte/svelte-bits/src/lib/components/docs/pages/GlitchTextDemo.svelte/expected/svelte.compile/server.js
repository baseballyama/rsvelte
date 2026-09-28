import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlitchText from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte';
import glitchTextSource from '$lib/components/library/TextAnimations/GlitchText/GlitchText.svelte?raw';

export default function GlitchTextDemo($$renderer) {
	const DEFAULTS = { speed: 1, enableShadows: true, enableOnHover: false };
	let speed = DEFAULTS.speed;
	let enableShadows = DEFAULTS.enableShadows;
	let enableOnHover = DEFAULTS.enableOnHover;
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || enableShadows !== DEFAULTS.enableShadows || enableOnHover !== DEFAULTS.enableOnHover);

	function reset() {
		speed = DEFAULTS.speed;
		enableShadows = DEFAULTS.enableShadows;
		enableOnHover = DEFAULTS.enableOnHover;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import GlitchText from '$lib/components/GlitchText.svelte';
${'</' + 'script>'}

<GlitchText
  text={${enableOnHover ? '"Hover Me"' : '"Svelte Bits"'}}
  speed={${speed}}
  enableShadows={${enableShadows}}
  enableOnHover={${enableOnHover}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '-',
			description: 'The text content that will display the glitch effect.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Multiplier for the animation speed. Higher values slow down the glitch effect.'
		},

		{
			name: 'enableShadows',
			type: 'boolean',
			default: 'true',
			description: 'Show the cyan/red text shadow split.'
		},

		{
			name: 'enableOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Only run the glitch effect while hovered.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		},

		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'React Bits-compatible extra class prop.'
		}
	];

	$.head('80binw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Glitch Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Glitch Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container">`);

			GlitchText($$renderer, {
				text: enableOnHover ? 'Hover Me' : 'Svelte Bits',
				speed,
				enableShadows,
				enableOnHover
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'glitch-text',
				usage: usage(),
				source: glitchTextSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0.1,
						max: 2,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Shadows',
						checked: enableShadows,
						onChange: (v) => enableShadows = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable On Hover',
						checked: enableOnHover,
						onChange: (v) => enableOnHover = v
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
			componentName: 'GlitchText',
			usage: usage(),
			source: glitchTextSource,
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