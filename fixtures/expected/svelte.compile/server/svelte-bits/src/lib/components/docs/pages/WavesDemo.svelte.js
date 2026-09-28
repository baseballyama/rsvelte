import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Waves from '$lib/components/library/Backgrounds/Waves/Waves.svelte';
import source from '$lib/components/library/Backgrounds/Waves/Waves.svelte?raw';

export default function WavesDemo($$renderer) {
	const D = {
		lineColor: '#ff8a3d',
		backgroundColor: 'transparent',
		waveSpeedX: 0.0125,
		waveSpeedY: 0.005,
		waveAmpX: 32,
		waveAmpY: 16,
		xGap: 10,
		yGap: 32,
		friction: 0.925,
		tension: 0.005,
		maxCursorMove: 100
	};

	let lineColor = D.lineColor;
	let backgroundColor = D.backgroundColor;
	let waveSpeedX = D.waveSpeedX;
	let waveSpeedY = D.waveSpeedY;
	let waveAmpX = D.waveAmpX;
	let waveAmpY = D.waveAmpY;
	let xGap = D.xGap;
	let yGap = D.yGap;
	let friction = D.friction;
	let tension = D.tension;
	let maxCursorMove = D.maxCursorMove;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => lineColor !== D.lineColor || backgroundColor !== D.backgroundColor || waveSpeedX !== D.waveSpeedX || waveSpeedY !== D.waveSpeedY || waveAmpX !== D.waveAmpX || waveAmpY !== D.waveAmpY || xGap !== D.xGap || yGap !== D.yGap || friction !== D.friction || tension !== D.tension || maxCursorMove !== D.maxCursorMove);

	function reset() {
		lineColor = D.lineColor;
		backgroundColor = D.backgroundColor;
		waveSpeedX = D.waveSpeedX;
		waveSpeedY = D.waveSpeedY;
		waveAmpX = D.waveAmpX;
		waveAmpY = D.waveAmpY;
		xGap = D.xGap;
		yGap = D.yGap;
		friction = D.friction;
		tension = D.tension;
		maxCursorMove = D.maxCursorMove;
	}

	const usage = $.derived(() => `${sO}
  import Waves from '$lib/components/Waves.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Waves lineColor="${lineColor}" />
</div>`);

	const props = [
		{
			name: 'lineColor',
			type: 'string',
			default: "'black'",
			description: 'Stroke color of the wavy lines.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Background color.'
		},

		{
			name: 'waveSpeedX',
			type: 'number',
			default: '0.0125',
			description: 'Horizontal wave speed.'
		},

		{
			name: 'waveSpeedY',
			type: 'number',
			default: '0.005',
			description: 'Vertical wave speed.'
		},

		{
			name: 'waveAmpX',
			type: 'number',
			default: '32',
			description: 'Horizontal wave amplitude.'
		},

		{
			name: 'waveAmpY',
			type: 'number',
			default: '16',
			description: 'Vertical wave amplitude.'
		},

		{
			name: 'xGap',
			type: 'number',
			default: '10',
			description: 'Horizontal point spacing.'
		},

		{
			name: 'yGap',
			type: 'number',
			default: '32',
			description: 'Vertical point spacing.'
		},

		{
			name: 'friction',
			type: 'number',
			default: '0.925',
			description: 'Cursor velocity friction.'
		},

		{
			name: 'tension',
			type: 'number',
			default: '0.005',
			description: 'Spring tension to rest.'
		},

		{
			name: 'maxCursorMove',
			type: 'number',
			default: '100',
			description: 'Max cursor offset per point.'
		}
	];

	$.head('wwvlla', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Waves - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Waves</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			Waves($$renderer, {
				lineColor,
				backgroundColor,
				waveSpeedX,
				waveSpeedY,
				waveAmpX,
				waveAmpY,
				xGap,
				yGap,
				friction,
				tension,
				maxCursorMove
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'waves', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Line Color',
						value: lineColor,
						onChange: (v) => lineColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Speed X',
						min: 0,
						max: 0.05,
						step: 0.001,
						value: waveSpeedX,
						onChange: (v) => waveSpeedX = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Speed Y',
						min: 0,
						max: 0.05,
						step: 0.001,
						value: waveSpeedY,
						onChange: (v) => waveSpeedY = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amp X',
						min: 0,
						max: 100,
						step: 1,
						value: waveAmpX,
						onChange: (v) => waveAmpX = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amp Y',
						min: 0,
						max: 100,
						step: 1,
						value: waveAmpY,
						onChange: (v) => waveAmpY = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'X Gap',
						min: 4,
						max: 50,
						step: 1,
						value: xGap,
						onChange: (v) => xGap = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Y Gap',
						min: 8,
						max: 80,
						step: 1,
						value: yGap,
						onChange: (v) => yGap = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Friction',
						min: 0.8,
						max: 1,
						step: 0.005,
						value: friction,
						onChange: (v) => friction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Tension',
						min: 0,
						max: 0.05,
						step: 0.001,
						value: tension,
						onChange: (v) => tension = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Cursor Move',
						min: 10,
						max: 300,
						step: 5,
						value: maxCursorMove,
						onChange: (v) => maxCursorMove = v
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
			componentName: 'Waves',
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