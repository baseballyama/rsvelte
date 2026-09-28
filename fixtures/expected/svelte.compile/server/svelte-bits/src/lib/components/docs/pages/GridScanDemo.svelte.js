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
import GridScan from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte';
import source from '$lib/components/library/Backgrounds/GridScan/GridScan.svelte?raw';

export default function GridScanDemo($$renderer) {
	const D = {
		linesColor: '#3A2D24',
		scanColor: '#ff8a3d',
		scanOpacity: 0.4,
		gridScale: 0.1,
		lineThickness: 1,
		lineJitter: 0.1,
		lineStyle: 'solid',
		scanDirection: 'pingpong',
		scanDuration: 2,
		scanDelay: 2,
		scanSoftness: 2,
		scanGlow: 0.5,
		scanPhaseTaper: 0.9,
		bloomIntensity: 0,
		chromaticAberration: 0.002,
		noiseIntensity: 0.01,
		sensitivity: 0.55,
		enableWebcam: false,
		enablePost: true
	};

	let linesColor = D.linesColor;
	let scanColor = D.scanColor;
	let scanOpacity = D.scanOpacity;
	let gridScale = D.gridScale;
	let lineThickness = D.lineThickness;
	let lineJitter = D.lineJitter;
	let lineStyle = D.lineStyle;
	let scanDirection = D.scanDirection;
	let scanDuration = D.scanDuration;
	let scanDelay = D.scanDelay;
	let scanSoftness = D.scanSoftness;
	let scanGlow = D.scanGlow;
	let scanPhaseTaper = D.scanPhaseTaper;
	let bloomIntensity = D.bloomIntensity;
	let chromaticAberration = D.chromaticAberration;
	let noiseIntensity = D.noiseIntensity;
	let sensitivity = D.sensitivity;
	let enableWebcam = D.enableWebcam;
	let enablePost = D.enablePost;
	let showContent = true;
	let key = 0;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => linesColor !== D.linesColor || scanColor !== D.scanColor || scanOpacity !== D.scanOpacity || gridScale !== D.gridScale || lineThickness !== D.lineThickness || lineJitter !== D.lineJitter || lineStyle !== D.lineStyle || scanDirection !== D.scanDirection || scanDuration !== D.scanDuration || scanDelay !== D.scanDelay || scanSoftness !== D.scanSoftness || scanGlow !== D.scanGlow || scanPhaseTaper !== D.scanPhaseTaper || bloomIntensity !== D.bloomIntensity || chromaticAberration !== D.chromaticAberration || noiseIntensity !== D.noiseIntensity || sensitivity !== D.sensitivity || enableWebcam !== D.enableWebcam || enablePost !== D.enablePost);

	function reset() {
		linesColor = D.linesColor;
		scanColor = D.scanColor;
		scanOpacity = D.scanOpacity;
		gridScale = D.gridScale;
		lineThickness = D.lineThickness;
		lineJitter = D.lineJitter;
		lineStyle = D.lineStyle;
		scanDirection = D.scanDirection;
		scanDuration = D.scanDuration;
		scanDelay = D.scanDelay;
		scanSoftness = D.scanSoftness;
		scanGlow = D.scanGlow;
		scanPhaseTaper = D.scanPhaseTaper;
		bloomIntensity = D.bloomIntensity;
		chromaticAberration = D.chromaticAberration;
		noiseIntensity = D.noiseIntensity;
		sensitivity = D.sensitivity;
		enableWebcam = D.enableWebcam;
		enablePost = D.enablePost;
		key++;
	}

	const usage = $.derived(() => `${sO}
  import GridScan from '$lib/components/GridScan.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridScan linesColor="${linesColor}" scanColor="${scanColor}" />
</div>`);

	const props = [
		{
			name: 'linesColor',
			type: 'string',
			default: '"#222222"',
			description: 'Grid line color.'
		},

		{
			name: 'scanColor',
			type: 'string',
			default: '"#FF9FFC"',
			description: 'Scan beam color.'
		},

		{
			name: 'scanOpacity',
			type: 'number',
			default: '0.4',
			description: 'Scan opacity.'
		},

		{
			name: 'gridScale',
			type: 'number',
			default: '0.1',
			description: 'Grid scale.'
		},

		{
			name: 'lineThickness',
			type: 'number',
			default: '1',
			description: 'Line thickness in pixels.'
		},

		{
			name: 'lineJitter',
			type: 'number',
			default: '0.1',
			description: 'Line jitter [0-1].'
		},

		{
			name: 'lineStyle',
			type: '"solid" | "dashed" | "dotted"',
			default: '"solid"',
			description: 'Line style.'
		},

		{
			name: 'scanDirection',
			type: '"forward" | "backward" | "pingpong"',
			default: '"pingpong"',
			description: 'Scan direction.'
		},

		{
			name: 'scanDuration',
			type: 'number',
			default: '2',
			description: 'Scan duration (seconds).'
		},

		{
			name: 'scanDelay',
			type: 'number',
			default: '2',
			description: 'Delay between scans.'
		},

		{
			name: 'scanSoftness',
			type: 'number',
			default: '2',
			description: 'Scan beam softness.'
		},

		{
			name: 'scanGlow',
			type: 'number',
			default: '0.5',
			description: 'Scan glow.'
		},

		{
			name: 'scanPhaseTaper',
			type: 'number',
			default: '0.9',
			description: 'Phase taper.'
		},

		{
			name: 'enablePost',
			type: 'boolean',
			default: 'true',
			description: 'Enable postprocessing.'
		},

		{
			name: 'bloomIntensity',
			type: 'number',
			default: '0',
			description: 'Bloom intensity.'
		},

		{
			name: 'chromaticAberration',
			type: 'number',
			default: '0.002',
			description: 'Chromatic aberration.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '0.01',
			description: 'Static noise.'
		},

		{
			name: 'sensitivity',
			type: 'number',
			default: '0.55',
			description: 'Mouse/face sensitivity [0-1].'
		},

		{
			name: 'enableWebcam',
			type: 'boolean',
			default: 'false',
			description: 'Enable face tracking.'
		},

		{
			name: 'showPreview',
			type: 'boolean',
			default: 'false',
			description: 'Show webcam preview.'
		},

		{
			name: 'modelsPath',
			type: 'string',
			default: 'face-api CDN',
			description: 'face-api models URL.'
		},

		{
			name: 'enableGyro',
			type: 'boolean',
			default: 'false',
			description: 'Enable device orientation.'
		},

		{
			name: 'scanOnClick',
			type: 'boolean',
			default: 'false',
			description: 'Trigger scan on click.'
		},

		{
			name: 'snapBackDelay',
			type: 'number',
			default: '250',
			description: 'Snap-back delay (ms).'
		}
	];

	$.head('1q73rbn', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Grid Scan - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Grid Scan</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!---->`);

			{
				GridScan($$renderer, {
					linesColor,
					scanColor,
					scanOpacity,
					gridScale,
					lineThickness,
					lineJitter,
					lineStyle,
					scanDirection,
					scanDuration,
					scanDelay,
					scanSoftness,
					scanGlow,
					scanPhaseTaper,
					bloomIntensity,
					chromaticAberration,
					noiseIntensity,
					sensitivity,
					enableWebcam,
					enablePost
				});
			}

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'grid-scan', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Lines Color',
						value: linesColor,
						onChange: (v) => linesColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Scan Color',
						value: scanColor,
						onChange: (v) => scanColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scan Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						value: scanOpacity,
						onChange: (v) => scanOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Grid Scale',
						min: 0.02,
						max: 0.5,
						step: 0.005,
						value: gridScale,
						onChange: (v) => gridScale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Line Thickness',
						min: 0.5,
						max: 5,
						step: 0.1,
						value: lineThickness,
						onChange: (v) => lineThickness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Line Jitter',
						min: 0,
						max: 1,
						step: 0.01,
						value: lineJitter,
						onChange: (v) => lineJitter = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Line Style',
						value: lineStyle,
						options: [
							{ label: 'Solid', value: 'solid' },
							{ label: 'Dashed', value: 'dashed' },
							{ label: 'Dotted', value: 'dotted' }
						],
						onChange: (v) => lineStyle = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Scan Direction',
						value: scanDirection,
						options: [
							{ label: 'Forward', value: 'forward' },
							{ label: 'Backward', value: 'backward' },
							{ label: 'Ping-Pong', value: 'pingpong' }
						],
						onChange: (v) => scanDirection = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scan Duration',
						min: 0.1,
						max: 10,
						step: 0.1,
						value: scanDuration,
						onChange: (v) => scanDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scan Delay',
						min: 0,
						max: 10,
						step: 0.1,
						value: scanDelay,
						onChange: (v) => scanDelay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scan Softness',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: scanSoftness,
						onChange: (v) => scanSoftness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scan Glow',
						min: 0.1,
						max: 3,
						step: 0.05,
						value: scanGlow,
						onChange: (v) => scanGlow = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Phase Taper',
						min: 0,
						max: 0.49,
						step: 0.01,
						value: scanPhaseTaper,
						onChange: (v) => scanPhaseTaper = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Bloom',
						min: 0,
						max: 3,
						step: 0.05,
						value: bloomIntensity,
						onChange: (v) => bloomIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Chromatic Aberration',
						min: 0,
						max: 0.02,
						step: 0.0005,
						value: chromaticAberration,
						onChange: (v) => chromaticAberration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise',
						min: 0,
						max: 0.2,
						step: 0.005,
						value: noiseIntensity,
						onChange: (v) => noiseIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Sensitivity',
						min: 0,
						max: 1,
						step: 0.01,
						value: sensitivity,
						onChange: (v) => sensitivity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Postprocessing',
						checked: enablePost,
						onChange: (v) => {
							enablePost = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Enable Webcam',
						checked: enableWebcam,
						onChange: (v) => {
							enableWebcam = v;
							key++;
						}
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
			componentName: 'GridScan',
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