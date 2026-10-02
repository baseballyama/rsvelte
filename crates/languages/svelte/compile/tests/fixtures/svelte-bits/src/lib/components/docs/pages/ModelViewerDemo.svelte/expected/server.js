import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ModelViewer from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte';
import source from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte?raw';

export default function ModelViewerDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const URLS = {
			toyCar: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb',
			sheenChair: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb'
		};

		const DEFAULTS = {
			selectedModel: 'toyCar',
			modelXOffset: 0.5,
			modelYOffset: 0,
			enableMouseParallax: true,
			enableHoverRotation: true,
			environmentPreset: 'forest',
			fadeIn: false,
			autoRotate: false,
			autoRotateSpeed: 0.35,
			showScreenshotButton: true
		};

		let selectedModel = DEFAULTS.selectedModel;
		let modelXOffset = DEFAULTS.modelXOffset;
		let modelYOffset = DEFAULTS.modelYOffset;
		let enableMouseParallax = DEFAULTS.enableMouseParallax;
		let enableHoverRotation = DEFAULTS.enableHoverRotation;
		let environmentPreset = DEFAULTS.environmentPreset;
		let fadeIn = DEFAULTS.fadeIn;
		let autoRotate = DEFAULTS.autoRotate;
		let autoRotateSpeed = DEFAULTS.autoRotateSpeed;
		let showScreenshotButton = DEFAULTS.showScreenshotButton;
		let key = 0;
		const hasChanges = $.derived(() => selectedModel !== DEFAULTS.selectedModel || modelXOffset !== DEFAULTS.modelXOffset || modelYOffset !== DEFAULTS.modelYOffset || enableMouseParallax !== DEFAULTS.enableMouseParallax || enableHoverRotation !== DEFAULTS.enableHoverRotation || environmentPreset !== DEFAULTS.environmentPreset || fadeIn !== DEFAULTS.fadeIn || autoRotate !== DEFAULTS.autoRotate || autoRotateSpeed !== DEFAULTS.autoRotateSpeed || showScreenshotButton !== DEFAULTS.showScreenshotButton);

		function reset() {
			selectedModel = DEFAULTS.selectedModel;
			modelXOffset = DEFAULTS.modelXOffset;
			modelYOffset = DEFAULTS.modelYOffset;
			enableMouseParallax = DEFAULTS.enableMouseParallax;
			enableHoverRotation = DEFAULTS.enableHoverRotation;
			environmentPreset = DEFAULTS.environmentPreset;
			fadeIn = DEFAULTS.fadeIn;
			autoRotate = DEFAULTS.autoRotate;
			autoRotateSpeed = DEFAULTS.autoRotateSpeed;
			showScreenshotButton = DEFAULTS.showScreenshotButton;
			key++;
		}

		const usage = `<ModelViewer url="/model.glb" width={400} height={400} />`;

		const props = [
			{
				name: 'url',
				type: 'string',
				default: '-',
				description: 'GLB/GLTF/FBX/OBJ URL.'
			},

			{
				name: 'width',
				type: 'number | string',
				default: '400',
				description: 'Container width.'
			},

			{
				name: 'height',
				type: 'number | string',
				default: '400',
				description: 'Container height.'
			},

			{
				name: 'modelXOffset',
				type: 'number',
				default: '0',
				description: 'Horizontal offset.'
			},

			{
				name: 'modelYOffset',
				type: 'number',
				default: '0',
				description: 'Vertical offset.'
			},

			{
				name: 'defaultRotationX',
				type: 'number',
				default: '-50',
				description: 'Initial X rotation (deg).'
			},

			{
				name: 'defaultRotationY',
				type: 'number',
				default: '20',
				description: 'Initial Y rotation (deg).'
			},

			{
				name: 'defaultZoom',
				type: 'number',
				default: '0.5',
				description: 'Initial zoom.'
			},

			{
				name: 'minZoomDistance',
				type: 'number',
				default: '0.5',
				description: 'Min zoom.'
			},

			{
				name: 'maxZoomDistance',
				type: 'number',
				default: '10',
				description: 'Max zoom.'
			},

			{
				name: 'enableMouseParallax',
				type: 'boolean',
				default: 'true',
				description: 'Mouse parallax.'
			},

			{
				name: 'enableManualRotation',
				type: 'boolean',
				default: 'true',
				description: 'Drag to rotate.'
			},

			{
				name: 'enableHoverRotation',
				type: 'boolean',
				default: 'true',
				description: 'Hover rotation.'
			},

			{
				name: 'enableManualZoom',
				type: 'boolean',
				default: 'true',
				description: 'Wheel/pinch zoom.'
			},

			{
				name: 'environmentPreset',
				type: 'string',
				default: '"forest"',
				description: 'Environment preset.'
			},

			{
				name: 'autoFrame',
				type: 'boolean',
				default: 'false',
				description: 'Auto-frame on load.'
			},

			{
				name: 'placeholderSrc',
				type: 'string',
				default: '-',
				description: 'Loading placeholder image.'
			},

			{
				name: 'showScreenshotButton',
				type: 'boolean',
				default: 'true',
				description: 'Show screenshot button.'
			},

			{
				name: 'fadeIn',
				type: 'boolean',
				default: 'false',
				description: 'Fade in on load.'
			},

			{
				name: 'autoRotate',
				type: 'boolean',
				default: 'false',
				description: 'Auto-rotate.'
			},

			{
				name: 'autoRotateSpeed',
				type: 'number',
				default: '0.35',
				description: 'Auto-rotation speed.'
			},

			{
				name: 'onModelLoaded',
				type: '() => void',
				default: '-',
				description: 'Loaded callback.'
			}
		];

		$.head('ivthap', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Model Viewer - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<h1 class="sub-category">Model Viewer</h1> `);

		{
			function preview($$renderer) {
				$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!---->`);

				{
					ModelViewer($$renderer, {
						url: URLS[selectedModel],
						width: '100%',
						height: 600,
						modelXOffset,
						modelYOffset,
						enableMouseParallax,
						enableHoverRotation,
						environmentPreset,
						fadeIn,
						autoRotate,
						autoRotateSpeed,
						showScreenshotButton
					});
				}

				$$renderer.push(`<!----></div>`);
			}

			function code($$renderer) {
				DemoCodeTab($$renderer, { slug: 'model-viewer', usage, source });
			}

			function customize($$renderer) {
				Customize($$renderer, {
					children: ($$renderer) => {
						PreviewSelect($$renderer, {
							title: 'Model',
							value: selectedModel,
							options: [
								{ label: 'Toy Car', value: 'toyCar' },
								{ label: 'Sheen Chair', value: 'sheenChair' }
							],

							onChange: (v) => {
								selectedModel = v;
								key++;
							}
						});

						$$renderer.push(`<!----> `);

						PreviewSelect($$renderer, {
							title: 'Environment',
							value: environmentPreset,
							options: [
								'city',
								'sunset',
								'night',
								'dawn',
								'studio',
								'apartment',
								'forest',
								'park',
								'none'
							].map((p) => ({ label: p, value: p })),

							onChange: (v) => {
								environmentPreset = v;
								key++;
							}
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Model X Offset',
							min: -2,
							max: 2,
							step: 0.1,
							value: modelXOffset,
							onChange: (v) => modelXOffset = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Model Y Offset',
							min: -2,
							max: 2,
							step: 0.1,
							value: modelYOffset,
							onChange: (v) => modelYOffset = v
						});

						$$renderer.push(`<!----> `);

						PreviewSlider($$renderer, {
							title: 'Auto Rotate Speed',
							min: 0,
							max: 3,
							step: 0.05,
							value: autoRotateSpeed,
							onChange: (v) => autoRotateSpeed = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Mouse Parallax',
							checked: enableMouseParallax,
							onChange: (v) => enableMouseParallax = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Hover Rotation',
							checked: enableHoverRotation,
							onChange: (v) => enableHoverRotation = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Fade In',
							checked: fadeIn,
							onChange: (v) => {
								fadeIn = v;
								key++;
							}
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Auto Rotate',
							checked: autoRotate,
							onChange: (v) => autoRotate = v
						});

						$$renderer.push(`<!----> `);

						PreviewSwitch($$renderer, {
							title: 'Screenshot Button',
							checked: showScreenshotButton,
							onChange: (v) => showScreenshotButton = v
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
				componentName: 'ModelViewer',
				usage,
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
	});
}