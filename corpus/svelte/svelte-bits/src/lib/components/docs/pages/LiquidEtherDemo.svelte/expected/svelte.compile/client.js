import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LiquidEther from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte';
import source from '$lib/components/library/Backgrounds/LiquidEther/LiquidEther.svelte?raw';

var root = $.from_html(`<div class="demo-container relative h-[500px] overflow-hidden p-0"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Liquid Ether</h1> <!>`, 1);

export default function LiquidEtherDemo($$anchor, $$props) {
	$.push($$props, true);

	const DEFAULTS = {
		color0: '#FF3E00',
		color1: '#FF8A4C',
		color2: '#FFB089',
		mouseForce: 20,
		cursorSize: 100,
		resolution: 0.5,
		isViscous: true,
		viscous: 30,
		iterationsViscous: 32,
		iterationsPoisson: 32,
		isBounce: false,
		autoDemo: true,
		autoSpeed: 0.5,
		autoIntensity: 2.2
	};

	let color0 = $.state($.proxy(DEFAULTS.color0));
	let color1 = $.state($.proxy(DEFAULTS.color1));
	let color2 = $.state($.proxy(DEFAULTS.color2));
	let mouseForce = $.state($.proxy(DEFAULTS.mouseForce));
	let cursorSize = $.state($.proxy(DEFAULTS.cursorSize));
	let resolution = $.state($.proxy(DEFAULTS.resolution));
	let isViscous = $.state($.proxy(DEFAULTS.isViscous));
	let viscous = $.state($.proxy(DEFAULTS.viscous));
	let iterationsViscous = $.state($.proxy(DEFAULTS.iterationsViscous));
	let iterationsPoisson = $.state($.proxy(DEFAULTS.iterationsPoisson));
	let isBounce = $.state($.proxy(DEFAULTS.isBounce));
	let autoDemo = $.state($.proxy(DEFAULTS.autoDemo));
	let autoSpeed = $.state($.proxy(DEFAULTS.autoSpeed));
	let autoIntensity = $.state($.proxy(DEFAULTS.autoIntensity));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const colors = $.derived(() => [$.get(color0), $.get(color1), $.get(color2)].filter(Boolean));
	const hasChanges = $.derived(() => $.get(color0) !== DEFAULTS.color0 || $.get(color1) !== DEFAULTS.color1 || $.get(color2) !== DEFAULTS.color2 || $.get(mouseForce) !== DEFAULTS.mouseForce || $.get(cursorSize) !== DEFAULTS.cursorSize || $.get(resolution) !== DEFAULTS.resolution || $.get(isViscous) !== DEFAULTS.isViscous || $.get(viscous) !== DEFAULTS.viscous || $.get(iterationsViscous) !== DEFAULTS.iterationsViscous || $.get(iterationsPoisson) !== DEFAULTS.iterationsPoisson || $.get(isBounce) !== DEFAULTS.isBounce || $.get(autoDemo) !== DEFAULTS.autoDemo || $.get(autoSpeed) !== DEFAULTS.autoSpeed || $.get(autoIntensity) !== DEFAULTS.autoIntensity);

	function reset() {
		$.set(color0, DEFAULTS.color0, true);
		$.set(color1, DEFAULTS.color1, true);
		$.set(color2, DEFAULTS.color2, true);
		$.set(mouseForce, DEFAULTS.mouseForce, true);
		$.set(cursorSize, DEFAULTS.cursorSize, true);
		$.set(resolution, DEFAULTS.resolution, true);
		$.set(isViscous, DEFAULTS.isViscous, true);
		$.set(viscous, DEFAULTS.viscous, true);
		$.set(iterationsViscous, DEFAULTS.iterationsViscous, true);
		$.set(iterationsPoisson, DEFAULTS.iterationsPoisson, true);
		$.set(isBounce, DEFAULTS.isBounce, true);
		$.set(autoDemo, DEFAULTS.autoDemo, true);
		$.set(autoSpeed, DEFAULTS.autoSpeed, true);
		$.set(autoIntensity, DEFAULTS.autoIntensity, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import LiquidEther from '$lib/components/LiquidEther.svelte';
${scriptClose}

<div style="width:100%;height:600px;position:relative;">
  <LiquidEther
    colors={['${$.get(color0)}', '${$.get(color1)}', '${$.get(color2)}']}
    mouseForce={${$.get(mouseForce)}}
    cursorSize={${$.get(cursorSize)}}
    isViscous={${$.get(isViscous)}}
    viscous={${$.get(viscous)}}
    iterationsViscous={${$.get(iterationsViscous)}}
    iterationsPoisson={${$.get(iterationsPoisson)}}
    resolution={${$.get(resolution)}}
    isBounce={${$.get(isBounce)}}
    autoDemo={${$.get(autoDemo)}}
    autoSpeed={${$.get(autoSpeed)}}
    autoIntensity={${$.get(autoIntensity)}}
  />
</div>`);

	const props = [
		{
			name: 'colors',
			type: 'string[]',
			default: '["#FF8A4C", "#FFC18A", "#FF6B2C"]',
			description: 'Array of hex color stops used to build the velocity-to-color palette.'
		},

		{
			name: 'mouseForce',
			type: 'number',
			default: '20',
			description: 'Strength multiplier applied to mouse / touch movement when injecting velocity.'
		},

		{
			name: 'cursorSize',
			type: 'number',
			default: '100',
			description: 'Radius (in pixels at base resolution) of the force brush.'
		},

		{
			name: 'resolution',
			type: 'number',
			default: '0.5',
			description: 'Simulation texture scale relative to canvas size.'
		},

		{
			name: 'dt',
			type: 'number',
			default: '0.014',
			description: 'Fixed simulation timestep used inside the advection / diffusion passes.'
		},

		{
			name: 'BFECC',
			type: 'boolean',
			default: 'true',
			description: 'Enable BFECC advection for crisper flow.'
		},

		{
			name: 'isViscous',
			type: 'boolean',
			default: 'false',
			description: 'Toggle iterative viscosity solve.'
		},

		{
			name: 'viscous',
			type: 'number',
			default: '30',
			description: 'Viscosity coefficient used when isViscous is true.'
		},

		{
			name: 'iterationsViscous',
			type: 'number',
			default: '32',
			description: 'Number of viscosity iterations.'
		},

		{
			name: 'iterationsPoisson',
			type: 'number',
			default: '32',
			description: 'Number of pressure Poisson iterations.'
		},

		{
			name: 'isBounce',
			type: 'boolean',
			default: 'false',
			description: 'If true, shows bounce boundaries.'
		},

		{
			name: 'autoDemo',
			type: 'boolean',
			default: 'true',
			description: 'Enable idle auto-driving of the pointer.'
		},

		{
			name: 'autoSpeed',
			type: 'number',
			default: '0.5',
			description: 'Speed for auto pointer motion.'
		},

		{
			name: 'autoIntensity',
			type: 'number',
			default: '2.2',
			description: 'Multiplier applied to velocity delta while in auto mode.'
		},

		{
			name: 'takeoverDuration',
			type: 'number',
			default: '0.25',
			description: 'Seconds to interpolate from auto pointer to real cursor.'
		},

		{
			name: 'autoResumeDelay',
			type: 'number',
			default: '1000',
			description: 'Milliseconds of inactivity before auto mode resumes.'
		},

		{
			name: 'autoRampDuration',
			type: 'number',
			default: '0.6',
			description: 'Seconds to ramp auto movement speed after activation.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Optional class for the root container.'
		}
	];

	var fragment = root_3();

	$.head('rb7ll0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Liquid Ether - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LiquidEther(node_1, {
				get colors() {
					return $.get(colors);
				},

				get mouseForce() {
					return $.get(mouseForce);
				},

				get cursorSize() {
					return $.get(cursorSize);
				},

				get resolution() {
					return $.get(resolution);
				},

				get isViscous() {
					return $.get(isViscous);
				},

				get viscous() {
					return $.get(viscous);
				},

				get iterationsViscous() {
					return $.get(iterationsViscous);
				},

				get iterationsPoisson() {
					return $.get(iterationsPoisson);
				},

				get isBounce() {
					return $.get(isBounce);
				},

				get autoDemo() {
					return $.get(autoDemo);
				},

				get autoSpeed() {
					return $.get(autoSpeed);
				},

				get autoIntensity() {
					return $.get(autoIntensity);
				},
				autoResumeDelay: 500
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
				slug: 'liquid-ether',
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
					var fragment_3 = root_2();
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Color 1',
						get value() {
							return $.get(color0);
						},
						onChange: (v) => $.set(color0, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color 2',
						get value() {
							return $.get(color1);
						},
						onChange: (v) => $.set(color1, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewColorPicker(node_5, {
						title: 'Color 3',
						get value() {
							return $.get(color2);
						},
						onChange: (v) => $.set(color2, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Mouse Force',
						min: 0,
						max: 60,
						step: 1,
						get value() {
							return $.get(mouseForce);
						},
						onChange: (v) => $.set(mouseForce, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Cursor Size',
						min: 10,
						max: 300,
						step: 5,
						get value() {
							return $.get(cursorSize);
						},
						onChange: (v) => $.set(cursorSize, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Resolution',
						min: 0.2,
						max: 0.5,
						step: 0.05,
						get value() {
							return $.get(resolution);
						},
						onChange: (v) => $.set(resolution, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Auto Speed',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(autoSpeed);
						},
						onChange: (v) => $.set(autoSpeed, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Auto Intensity',
						min: 0,
						max: 4,
						step: 0.1,
						get value() {
							return $.get(autoIntensity);
						},
						onChange: (v) => $.set(autoIntensity, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Pressure',
						min: 1,
						max: 64,
						step: 1,
						get value() {
							return $.get(iterationsPoisson);
						},
						onChange: (v) => $.set(iterationsPoisson, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Bounce Edges',
						get checked() {
							return $.get(isBounce);
						},
						onChange: (v) => $.set(isBounce, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Auto Animate',
						get checked() {
							return $.get(autoDemo);
						},
						onChange: (v) => $.set(autoDemo, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
						title: 'Viscous',
						get checked() {
							return $.get(isViscous);
						},
						onChange: (v) => $.set(isViscous, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = root_1();
							var node_16 = $.first_child(fragment_4);

							PreviewSlider(node_16, {
								title: 'Viscous Coef',
								min: 1,
								max: 100,
								step: 1,
								get value() {
									return $.get(viscous);
								},
								onChange: (v) => $.set(viscous, v, true)
							});

							var node_17 = $.sibling(node_16, 2);

							PreviewSlider(node_17, {
								title: 'Viscous Iterations',
								min: 1,
								max: 64,
								step: 1,
								get value() {
									return $.get(iterationsViscous);
								},
								onChange: (v) => $.set(iterationsViscous, v, true)
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_15, ($$render) => {
							if ($.get(isViscous)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_3);
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
			componentName: 'LiquidEther',
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
	$.pop();
}