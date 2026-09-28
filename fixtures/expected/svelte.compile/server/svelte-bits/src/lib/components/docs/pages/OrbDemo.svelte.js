import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Orb from '$lib/components/library/Backgrounds/Orb/Orb.svelte';
import source from '$lib/components/library/Backgrounds/Orb/Orb.svelte?raw';

export default function OrbDemo($$renderer) {
	const D = {
		hue: 200,
		hoverIntensity: 0.5,
		rotateOnHover: true,
		forceHoverState: false,
		backgroundColor: '#14110E'
	};

	let hue = D.hue;
	let hoverIntensity = D.hoverIntensity;
	let rotateOnHover = D.rotateOnHover;
	let forceHoverState = D.forceHoverState;
	let backgroundColor = D.backgroundColor;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => hue !== D.hue || hoverIntensity !== D.hoverIntensity || rotateOnHover !== D.rotateOnHover || forceHoverState !== D.forceHoverState || backgroundColor !== D.backgroundColor);

	function reset() {
		hue = D.hue;
		hoverIntensity = D.hoverIntensity;
		rotateOnHover = D.rotateOnHover;
		forceHoverState = D.forceHoverState;
		backgroundColor = D.backgroundColor;
	}

	const usage = $.derived(() => `${sO}
  import Orb from '$lib/components/Orb.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Orb hue={${hue}} hoverIntensity={${hoverIntensity}} rotateOnHover={${rotateOnHover}} forceHoverState={${forceHoverState}} />
</div>`);

	const props = [
		{
			name: 'hue',
			type: 'number',
			default: '0',
			description: 'Hue rotation in degrees.'
		},

		{
			name: 'hoverIntensity',
			type: 'number',
			default: '0.2',
			description: 'Strength of hover distortion.'
		},

		{
			name: 'rotateOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Rotate while hovered.'
		},

		{
			name: 'forceHoverState',
			type: 'boolean',
			default: 'false',
			description: 'Force hover state always on.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: "'#000000'",
			description: 'Background color.'
		}
	];

	$.head('rny5yr', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Orb - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Orb</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"${$.attr_style('', { 'background-color': backgroundColor })}>`);

			Orb($$renderer, {
				hue,
				hoverIntensity,
				rotateOnHover,
				forceHoverState,
				backgroundColor
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'orb', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Hue',
						min: 0,
						max: 360,
						step: 1,
						value: hue,
						onChange: (v) => hue = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						value: hoverIntensity,
						onChange: (v) => hoverIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Rotate On Hover',
						checked: rotateOnHover,
						onChange: (v) => rotateOnHover = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Force Hover State',
						checked: forceHoverState,
						onChange: (v) => forceHoverState = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Background',
						value: backgroundColor,
						onChange: (v) => backgroundColor = v
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
			componentName: 'Orb',
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