import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PlasmaWave from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte';
import source from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte?raw';

export default function PlasmaWaveDemo($$renderer) {
	const D = {
		xOffset: 0,
		yOffset: 0,
		rotationDeg: 0,
		focalLength: 0.8,
		speed1: 0.05,
		speed2: 0.05,
		dir2: 1,
		bend1: 1,
		bend2: 0.5,
		color1: '#ff8a3d',
		color2: '#FFB089'
	};

	let xOffset = D.xOffset;
	let yOffset = D.yOffset;
	let rotationDeg = D.rotationDeg;
	let focalLength = D.focalLength;
	let speed1 = D.speed1;
	let speed2 = D.speed2;
	let dir2 = D.dir2;
	let bend1 = D.bend1;
	let bend2 = D.bend2;
	let color1 = D.color1;
	let color2 = D.color2;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => xOffset !== D.xOffset || yOffset !== D.yOffset || rotationDeg !== D.rotationDeg || focalLength !== D.focalLength || speed1 !== D.speed1 || speed2 !== D.speed2 || dir2 !== D.dir2 || bend1 !== D.bend1 || bend2 !== D.bend2 || color1 !== D.color1 || color2 !== D.color2);

	function reset() {
		xOffset = D.xOffset;
		yOffset = D.yOffset;
		rotationDeg = D.rotationDeg;
		focalLength = D.focalLength;
		speed1 = D.speed1;
		speed2 = D.speed2;
		dir2 = D.dir2;
		bend1 = D.bend1;
		bend2 = D.bend2;
		color1 = D.color1;
		color2 = D.color2;
	}

	const usage = $.derived(() => `${sO}
  import PlasmaWave from '$lib/components/PlasmaWave.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <PlasmaWave colors={["${color1}", "${color2}"]} />
</div>`);

	const colorsTuple = $.derived(() => [color1, color2]);

	const props = [
		{
			name: 'xOffset',
			type: 'number',
			default: '0',
			description: 'Horizontal offset in pixels.'
		},

		{
			name: 'yOffset',
			type: 'number',
			default: '0',
			description: 'Vertical offset in pixels.'
		},

		{
			name: 'rotationDeg',
			type: 'number',
			default: '0',
			description: 'Rotation angle in degrees.'
		},

		{
			name: 'focalLength',
			type: 'number',
			default: '0.8',
			description: 'Camera focal length.'
		},

		{
			name: 'speed1',
			type: 'number',
			default: '0.05',
			description: 'Speed of first wave.'
		},

		{
			name: 'speed2',
			type: 'number',
			default: '0.05',
			description: 'Speed of second wave.'
		},

		{
			name: 'dir2',
			type: 'number',
			default: '1',
			description: 'Direction of second wave.'
		},

		{
			name: 'bend1',
			type: 'number',
			default: '1',
			description: 'Bend of first wave.'
		},

		{
			name: 'bend2',
			type: 'number',
			default: '0.5',
			description: 'Bend of second wave.'
		},

		{
			name: 'colors',
			type: '[string, string]',
			default: "['#A855F7', '#06B6D4']",
			description: 'Pair of wave colors.'
		}
	];

	$.head('okky6t', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Plasma Wave - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Plasma Wave</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			PlasmaWave($$renderer, {
				xOffset,
				yOffset,
				rotationDeg,
				focalLength,
				speed1,
				speed2,
				dir2,
				bend1,
				bend2,
				colors: colorsTuple()
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'plasma-wave', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color 1', value: color1, onChange: (v) => color1 = v });
					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Color 2', value: color2, onChange: (v) => color2 = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						value: rotationDeg,
						onChange: (v) => rotationDeg = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Focal Length',
						min: 0.2,
						max: 2,
						step: 0.05,
						value: focalLength,
						onChange: (v) => focalLength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed 1',
						min: 0,
						max: 0.3,
						step: 0.005,
						value: speed1,
						onChange: (v) => speed1 = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed 2',
						min: 0,
						max: 0.3,
						step: 0.005,
						value: speed2,
						onChange: (v) => speed2 = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bend 1',
						min: 0,
						max: 3,
						step: 0.05,
						value: bend1,
						onChange: (v) => bend1 = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bend 2',
						min: 0,
						max: 3,
						step: 0.05,
						value: bend2,
						onChange: (v) => bend2 = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'X Offset',
						min: -200,
						max: 200,
						step: 1,
						value: xOffset,
						onChange: (v) => xOffset = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Y Offset',
						min: -200,
						max: 200,
						step: 1,
						value: yOffset,
						onChange: (v) => yOffset = v
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
			componentName: 'PlasmaWave',
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