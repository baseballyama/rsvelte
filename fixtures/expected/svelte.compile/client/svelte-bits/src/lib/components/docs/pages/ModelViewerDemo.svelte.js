import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ModelViewer from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte';
import source from '$lib/components/library/Components/ModelViewer/ModelViewer.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Model Viewer</h1> <!>`, 1);

export default function ModelViewerDemo($$anchor, $$props) {
	$.push($$props, true);

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

	let selectedModel = $.state($.proxy(DEFAULTS.selectedModel));
	let modelXOffset = $.state($.proxy(DEFAULTS.modelXOffset));
	let modelYOffset = $.state($.proxy(DEFAULTS.modelYOffset));
	let enableMouseParallax = $.state($.proxy(DEFAULTS.enableMouseParallax));
	let enableHoverRotation = $.state($.proxy(DEFAULTS.enableHoverRotation));
	let environmentPreset = $.state($.proxy(DEFAULTS.environmentPreset));
	let fadeIn = $.state($.proxy(DEFAULTS.fadeIn));
	let autoRotate = $.state($.proxy(DEFAULTS.autoRotate));
	let autoRotateSpeed = $.state($.proxy(DEFAULTS.autoRotateSpeed));
	let showScreenshotButton = $.state($.proxy(DEFAULTS.showScreenshotButton));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(selectedModel) !== DEFAULTS.selectedModel || $.get(modelXOffset) !== DEFAULTS.modelXOffset || $.get(modelYOffset) !== DEFAULTS.modelYOffset || $.get(enableMouseParallax) !== DEFAULTS.enableMouseParallax || $.get(enableHoverRotation) !== DEFAULTS.enableHoverRotation || $.get(environmentPreset) !== DEFAULTS.environmentPreset || $.get(fadeIn) !== DEFAULTS.fadeIn || $.get(autoRotate) !== DEFAULTS.autoRotate || $.get(autoRotateSpeed) !== DEFAULTS.autoRotateSpeed || $.get(showScreenshotButton) !== DEFAULTS.showScreenshotButton);

	function reset() {
		$.set(selectedModel, DEFAULTS.selectedModel, true);
		$.set(modelXOffset, DEFAULTS.modelXOffset, true);
		$.set(modelYOffset, DEFAULTS.modelYOffset, true);
		$.set(enableMouseParallax, DEFAULTS.enableMouseParallax, true);
		$.set(enableHoverRotation, DEFAULTS.enableHoverRotation, true);
		$.set(environmentPreset, DEFAULTS.environmentPreset, true);
		$.set(fadeIn, DEFAULTS.fadeIn, true);
		$.set(autoRotate, DEFAULTS.autoRotate, true);
		$.set(autoRotateSpeed, DEFAULTS.autoRotateSpeed, true);
		$.set(showScreenshotButton, DEFAULTS.showScreenshotButton, true);
		$.update(key);
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

	var fragment = root_2();

	$.head('ivthap', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Model Viewer - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key) + $.get(selectedModel), ($$anchor) => {
				ModelViewer($$anchor, {
					get url() {
						return URLS[$.get(selectedModel)];
					},
					width: '100%',
					height: 600,
					get modelXOffset() {
						return $.get(modelXOffset);
					},

					get modelYOffset() {
						return $.get(modelYOffset);
					},

					get enableMouseParallax() {
						return $.get(enableMouseParallax);
					},

					get enableHoverRotation() {
						return $.get(enableHoverRotation);
					},

					get environmentPreset() {
						return $.get(environmentPreset);
					},

					get fadeIn() {
						return $.get(fadeIn);
					},

					get autoRotate() {
						return $.get(autoRotate);
					},

					get autoRotateSpeed() {
						return $.get(autoRotateSpeed);
					},

					get showScreenshotButton() {
						return $.get(showScreenshotButton);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'model-viewer',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSelect(node_2, {
						title: 'Model',
						get value() {
							return $.get(selectedModel);
						},

						options: [
							{ label: 'Toy Car', value: 'toyCar' },
							{ label: 'Sheen Chair', value: 'sheenChair' }
						],

						onChange: (v) => {
							$.set(selectedModel, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => [
							'city',
							'sunset',
							'night',
							'dawn',
							'studio',
							'apartment',
							'forest',
							'park',
							'none'
						].map((p) => ({ label: p, value: p })));

						PreviewSelect(node_3, {
							title: 'Environment',
							get value() {
								return $.get(environmentPreset);
							},

							get options() {
								return $.get($0);
							},

							onChange: (v) => {
								$.set(environmentPreset, v, true);
								$.update(key);
							}
						});
					}

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Model X Offset',
						min: -2,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(modelXOffset);
						},
						onChange: (v) => $.set(modelXOffset, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Model Y Offset',
						min: -2,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(modelYOffset);
						},
						onChange: (v) => $.set(modelYOffset, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Auto Rotate Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(autoRotateSpeed);
						},
						onChange: (v) => $.set(autoRotateSpeed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Mouse Parallax',
						get checked() {
							return $.get(enableMouseParallax);
						},
						onChange: (v) => $.set(enableMouseParallax, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Hover Rotation',
						get checked() {
							return $.get(enableHoverRotation);
						},
						onChange: (v) => $.set(enableHoverRotation, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Fade In',
						get checked() {
							return $.get(fadeIn);
						},

						onChange: (v) => {
							$.set(fadeIn, v, true);
							$.update(key);
						}
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Auto Rotate',
						get checked() {
							return $.get(autoRotate);
						},
						onChange: (v) => $.set(autoRotate, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Screenshot Button',
						get checked() {
							return $.get(showScreenshotButton);
						},
						onChange: (v) => $.set(showScreenshotButton, v, true)
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
			componentName: 'ModelViewer',
			usage,
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
	$.pop();
}