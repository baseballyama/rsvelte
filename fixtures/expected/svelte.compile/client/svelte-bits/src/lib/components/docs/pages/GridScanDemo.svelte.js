import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Grid Scan</h1> <!>`, 1);

export default function GridScanDemo($$anchor) {
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

	let linesColor = $.state($.proxy(D.linesColor));
	let scanColor = $.state($.proxy(D.scanColor));
	let scanOpacity = $.state($.proxy(D.scanOpacity));
	let gridScale = $.state($.proxy(D.gridScale));
	let lineThickness = $.state($.proxy(D.lineThickness));
	let lineJitter = $.state($.proxy(D.lineJitter));
	let lineStyle = $.state($.proxy(D.lineStyle));
	let scanDirection = $.state($.proxy(D.scanDirection));
	let scanDuration = $.state($.proxy(D.scanDuration));
	let scanDelay = $.state($.proxy(D.scanDelay));
	let scanSoftness = $.state($.proxy(D.scanSoftness));
	let scanGlow = $.state($.proxy(D.scanGlow));
	let scanPhaseTaper = $.state($.proxy(D.scanPhaseTaper));
	let bloomIntensity = $.state($.proxy(D.bloomIntensity));
	let chromaticAberration = $.state($.proxy(D.chromaticAberration));
	let noiseIntensity = $.state($.proxy(D.noiseIntensity));
	let sensitivity = $.state($.proxy(D.sensitivity));
	let enableWebcam = $.state($.proxy(D.enableWebcam));
	let enablePost = $.state($.proxy(D.enablePost));
	let showContent = $.state(true);
	let key = $.state(0);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(linesColor) !== D.linesColor || $.get(scanColor) !== D.scanColor || $.get(scanOpacity) !== D.scanOpacity || $.get(gridScale) !== D.gridScale || $.get(lineThickness) !== D.lineThickness || $.get(lineJitter) !== D.lineJitter || $.get(lineStyle) !== D.lineStyle || $.get(scanDirection) !== D.scanDirection || $.get(scanDuration) !== D.scanDuration || $.get(scanDelay) !== D.scanDelay || $.get(scanSoftness) !== D.scanSoftness || $.get(scanGlow) !== D.scanGlow || $.get(scanPhaseTaper) !== D.scanPhaseTaper || $.get(bloomIntensity) !== D.bloomIntensity || $.get(chromaticAberration) !== D.chromaticAberration || $.get(noiseIntensity) !== D.noiseIntensity || $.get(sensitivity) !== D.sensitivity || $.get(enableWebcam) !== D.enableWebcam || $.get(enablePost) !== D.enablePost);

	function reset() {
		$.set(linesColor, D.linesColor, true);
		$.set(scanColor, D.scanColor, true);
		$.set(scanOpacity, D.scanOpacity, true);
		$.set(gridScale, D.gridScale, true);
		$.set(lineThickness, D.lineThickness, true);
		$.set(lineJitter, D.lineJitter, true);
		$.set(lineStyle, D.lineStyle, true);
		$.set(scanDirection, D.scanDirection, true);
		$.set(scanDuration, D.scanDuration, true);
		$.set(scanDelay, D.scanDelay, true);
		$.set(scanSoftness, D.scanSoftness, true);
		$.set(scanGlow, D.scanGlow, true);
		$.set(scanPhaseTaper, D.scanPhaseTaper, true);
		$.set(bloomIntensity, D.bloomIntensity, true);
		$.set(chromaticAberration, D.chromaticAberration, true);
		$.set(noiseIntensity, D.noiseIntensity, true);
		$.set(sensitivity, D.sensitivity, true);
		$.set(enableWebcam, D.enableWebcam, true);
		$.set(enablePost, D.enablePost, true);
		$.update(key);
	}

	const usage = $.derived(() => `${sO}
  import GridScan from '$lib/components/GridScan.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <GridScan linesColor="${$.get(linesColor)}" scanColor="${$.get(scanColor)}" />
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

	var fragment = root_2();

	$.head('1q73rbn', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Grid Scan - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				GridScan($$anchor, {
					get linesColor() {
						return $.get(linesColor);
					},

					get scanColor() {
						return $.get(scanColor);
					},

					get scanOpacity() {
						return $.get(scanOpacity);
					},

					get gridScale() {
						return $.get(gridScale);
					},

					get lineThickness() {
						return $.get(lineThickness);
					},

					get lineJitter() {
						return $.get(lineJitter);
					},

					get lineStyle() {
						return $.get(lineStyle);
					},

					get scanDirection() {
						return $.get(scanDirection);
					},

					get scanDuration() {
						return $.get(scanDuration);
					},

					get scanDelay() {
						return $.get(scanDelay);
					},

					get scanSoftness() {
						return $.get(scanSoftness);
					},

					get scanGlow() {
						return $.get(scanGlow);
					},

					get scanPhaseTaper() {
						return $.get(scanPhaseTaper);
					},

					get bloomIntensity() {
						return $.get(bloomIntensity);
					},

					get chromaticAberration() {
						return $.get(chromaticAberration);
					},

					get noiseIntensity() {
						return $.get(noiseIntensity);
					},

					get sensitivity() {
						return $.get(sensitivity);
					},

					get enableWebcam() {
						return $.get(enableWebcam);
					},

					get enablePost() {
						return $.get(enablePost);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'grid-scan',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewColorPicker(node_3, {
						title: 'Lines Color',
						get value() {
							return $.get(linesColor);
						},
						onChange: (v) => $.set(linesColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Scan Color',
						get value() {
							return $.get(scanColor);
						},
						onChange: (v) => $.set(scanColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Scan Opacity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(scanOpacity);
						},
						onChange: (v) => $.set(scanOpacity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Grid Scale',
						min: 0.02,
						max: 0.5,
						step: 0.005,
						get value() {
							return $.get(gridScale);
						},
						onChange: (v) => $.set(gridScale, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Line Thickness',
						min: 0.5,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(lineThickness);
						},
						onChange: (v) => $.set(lineThickness, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Line Jitter',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(lineJitter);
						},
						onChange: (v) => $.set(lineJitter, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSelect(node_9, {
						title: 'Line Style',
						get value() {
							return $.get(lineStyle);
						},

						options: [
							{ label: 'Solid', value: 'solid' },
							{ label: 'Dashed', value: 'dashed' },
							{ label: 'Dotted', value: 'dotted' }
						],
						onChange: (v) => $.set(lineStyle, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSelect(node_10, {
						title: 'Scan Direction',
						get value() {
							return $.get(scanDirection);
						},

						options: [
							{ label: 'Forward', value: 'forward' },
							{ label: 'Backward', value: 'backward' },
							{ label: 'Ping-Pong', value: 'pingpong' }
						],
						onChange: (v) => $.set(scanDirection, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Scan Duration',
						min: 0.1,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(scanDuration);
						},
						onChange: (v) => $.set(scanDuration, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Scan Delay',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(scanDelay);
						},
						onChange: (v) => $.set(scanDelay, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Scan Softness',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(scanSoftness);
						},
						onChange: (v) => $.set(scanSoftness, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Scan Glow',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(scanGlow);
						},
						onChange: (v) => $.set(scanGlow, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSlider(node_15, {
						title: 'Phase Taper',
						min: 0,
						max: 0.49,
						step: 0.01,
						get value() {
							return $.get(scanPhaseTaper);
						},
						onChange: (v) => $.set(scanPhaseTaper, v, true)
					});

					var node_16 = $.sibling(node_15, 2);

					PreviewSlider(node_16, {
						title: 'Bloom',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(bloomIntensity);
						},
						onChange: (v) => $.set(bloomIntensity, v, true)
					});

					var node_17 = $.sibling(node_16, 2);

					PreviewSlider(node_17, {
						title: 'Chromatic Aberration',
						min: 0,
						max: 0.02,
						step: 0.0005,
						get value() {
							return $.get(chromaticAberration);
						},
						onChange: (v) => $.set(chromaticAberration, v, true)
					});

					var node_18 = $.sibling(node_17, 2);

					PreviewSlider(node_18, {
						title: 'Noise',
						min: 0,
						max: 0.2,
						step: 0.005,
						get value() {
							return $.get(noiseIntensity);
						},
						onChange: (v) => $.set(noiseIntensity, v, true)
					});

					var node_19 = $.sibling(node_18, 2);

					PreviewSlider(node_19, {
						title: 'Sensitivity',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(sensitivity);
						},
						onChange: (v) => $.set(sensitivity, v, true)
					});

					var node_20 = $.sibling(node_19, 2);

					PreviewSwitch(node_20, {
						title: 'Enable Postprocessing',
						get checked() {
							return $.get(enablePost);
						},

						onChange: (v) => {
							$.set(enablePost, v, true);
							$.update(key);
						}
					});

					var node_21 = $.sibling(node_20, 2);

					PreviewSwitch(node_21, {
						title: 'Enable Webcam',
						get checked() {
							return $.get(enableWebcam);
						},

						onChange: (v) => {
							$.set(enableWebcam, v, true);
							$.update(key);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'GridScan',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}