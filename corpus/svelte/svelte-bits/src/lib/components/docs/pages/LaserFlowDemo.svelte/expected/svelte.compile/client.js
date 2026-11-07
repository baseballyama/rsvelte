import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import LaserFlow from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte';
import source from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte?raw';

var root = $.from_html(`<div></div> <img src="https://cdn.dribbble.com/userupload/15325964/file/original-25ae735b5d9255a4a31d3471fd1c346a.png?resize=1024x768&amp;vertical=center" alt="" style="position:absolute;top:-50%;width:100%;z-index:2;mix-blend-mode:luminosity;opacity:0.3;pointer-events:none;--mx:-9999px;--my:-9999px;-webkit-mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;"/>`, 1);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;" role="presentation"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Laser Flow</h1> <!>`, 1);

export default function LaserFlowDemo($$anchor) {
	const DEFAULTS = {
		selectedExample: 'box',
		color: '#FF8A4C',
		horizontalSizing: 0.5,
		verticalSizing: 2.0,
		wispDensity: 1,
		wispSpeed: 15.0,
		wispIntensity: 5.0,
		flowSpeed: 0.35,
		flowStrength: 0.25,
		fogIntensity: 0.45,
		fogScale: 0.3,
		fogFallSpeed: 0.6,
		decay: 1.1,
		falloffStart: 1.2
	};

	let selectedExample = $.state($.proxy(DEFAULTS.selectedExample));
	let color = $.state($.proxy(DEFAULTS.color));
	let horizontalSizing = $.state($.proxy(DEFAULTS.horizontalSizing));
	let verticalSizing = $.state($.proxy(DEFAULTS.verticalSizing));
	let wispDensity = $.state($.proxy(DEFAULTS.wispDensity));
	let wispSpeed = $.state($.proxy(DEFAULTS.wispSpeed));
	let wispIntensity = $.state($.proxy(DEFAULTS.wispIntensity));
	let flowSpeed = $.state($.proxy(DEFAULTS.flowSpeed));
	let flowStrength = $.state($.proxy(DEFAULTS.flowStrength));
	let fogIntensity = $.state($.proxy(DEFAULTS.fogIntensity));
	let fogScale = $.state($.proxy(DEFAULTS.fogScale));
	let fogFallSpeed = $.state($.proxy(DEFAULTS.fogFallSpeed));
	let decay = $.state($.proxy(DEFAULTS.decay));
	let falloffStart = $.state($.proxy(DEFAULTS.falloffStart));
	const hasChanges = $.derived(() => $.get(selectedExample) !== DEFAULTS.selectedExample || $.get(color) !== DEFAULTS.color || $.get(horizontalSizing) !== DEFAULTS.horizontalSizing || $.get(verticalSizing) !== DEFAULTS.verticalSizing || $.get(wispDensity) !== DEFAULTS.wispDensity || $.get(wispSpeed) !== DEFAULTS.wispSpeed || $.get(wispIntensity) !== DEFAULTS.wispIntensity || $.get(flowSpeed) !== DEFAULTS.flowSpeed || $.get(flowStrength) !== DEFAULTS.flowStrength || $.get(fogIntensity) !== DEFAULTS.fogIntensity || $.get(fogScale) !== DEFAULTS.fogScale || $.get(fogFallSpeed) !== DEFAULTS.fogFallSpeed || $.get(decay) !== DEFAULTS.decay || $.get(falloffStart) !== DEFAULTS.falloffStart);

	function reset() {
		$.set(selectedExample, DEFAULTS.selectedExample, true);
		$.set(color, DEFAULTS.color, true);
		$.set(horizontalSizing, DEFAULTS.horizontalSizing, true);
		$.set(verticalSizing, DEFAULTS.verticalSizing, true);
		$.set(wispDensity, DEFAULTS.wispDensity, true);
		$.set(wispSpeed, DEFAULTS.wispSpeed, true);
		$.set(wispIntensity, DEFAULTS.wispIntensity, true);
		$.set(flowSpeed, DEFAULTS.flowSpeed, true);
		$.set(flowStrength, DEFAULTS.flowStrength, true);
		$.set(fogIntensity, DEFAULTS.fogIntensity, true);
		$.set(fogScale, DEFAULTS.fogScale, true);
		$.set(fogFallSpeed, DEFAULTS.fogFallSpeed, true);
		$.set(decay, DEFAULTS.decay, true);
		$.set(falloffStart, DEFAULTS.falloffStart, true);
	}

	let containerRef;
	let revealImg;

	function onMove(e) {
		if (!containerRef || !revealImg) return;

		const rect = containerRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		revealImg.style.setProperty('--mx', `${x}px`);
		revealImg.style.setProperty('--my', `${y + rect.height * 0.5}px`);
	}

	function onLeave() {
		if (!revealImg) return;

		revealImg.style.setProperty('--mx', '-9999px');
		revealImg.style.setProperty('--my', '-9999px');
	}

	const horizontalBeamOffset = $.derived(() => $.get(selectedExample) === 'box' ? 0.1 : 0.0);
	const verticalBeamOffset = $.derived(() => $.get(selectedExample) === 'box' ? -0.2 : -0.5);
	const usage = $.derived(() => `<LaserFlow color="${$.get(color)}" flowSpeed={${$.get(flowSpeed)}} fogIntensity={${$.get(fogIntensity)}} wispDensity={${$.get(wispDensity)}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF79C6"',
			description: 'Beam color (hex).'
		},

		{
			name: 'flowSpeed',
			type: 'number',
			default: '0.35',
			description: "Speed of the beam's flow modulation."
		},

		{
			name: 'flowStrength',
			type: 'number',
			default: '0.25',
			description: "Strength of the beam's flow modulation."
		},

		{
			name: 'wispDensity',
			type: 'number',
			default: '1',
			description: 'Density of micro-streak wisps.'
		},

		{
			name: 'wispSpeed',
			type: 'number',
			default: '15.0',
			description: 'Speed of wisp motion.'
		},

		{
			name: 'wispIntensity',
			type: 'number',
			default: '5.0',
			description: 'Brightness of wisps.'
		},

		{
			name: 'fogIntensity',
			type: 'number',
			default: '0.45',
			description: 'Overall volumetric fog intensity.'
		},

		{
			name: 'fogScale',
			type: 'number',
			default: '0.3',
			description: 'Spatial scale for the fog noise.'
		},

		{
			name: 'fogFallSpeed',
			type: 'number',
			default: '0.6',
			description: 'Drift speed for the fog field.'
		},

		{
			name: 'horizontalBeamOffset',
			type: 'number',
			default: '0.1',
			description: 'Horizontal offset of the beam (0–1 of canvas width).'
		},

		{
			name: 'verticalBeamOffset',
			type: 'number',
			default: '0.0',
			description: 'Vertical offset of the beam (0–1 of canvas height).'
		},

		{
			name: 'horizontalSizing',
			type: 'number',
			default: '0.5',
			description: 'Horizontal sizing factor of the beam footprint.'
		},

		{
			name: 'verticalSizing',
			type: 'number',
			default: '2.0',
			description: 'Vertical sizing factor of the beam footprint.'
		},

		{
			name: 'mouseTiltStrength',
			type: 'number',
			default: '0.01',
			description: 'How much mouse x tilts the fog volume.'
		},

		{
			name: 'mouseSmoothTime',
			type: 'number',
			default: '0.0',
			description: 'Pointer smoothing time (seconds).'
		},

		{
			name: 'decay',
			type: 'number',
			default: '1.1',
			description: 'Beam decay shaping for sampling envelope.'
		},

		{
			name: 'falloffStart',
			type: 'number',
			default: '1.2',
			description: 'Falloff start radius used in inverse-square blending.'
		},

		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Device pixel ratio override (defaults to window.devicePixelRatio).'
		}
	];

	var fragment = root_3();

	$.head('15o8pvx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Laser Flow - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(selectedExample), ($$anchor) => {
				LaserFlow($$anchor, {
					get color() {
						return $.get(color);
					},

					get horizontalBeamOffset() {
						return $.get(horizontalBeamOffset);
					},

					get verticalBeamOffset() {
						return $.get(verticalBeamOffset);
					},

					get horizontalSizing() {
						return $.get(horizontalSizing);
					},

					get verticalSizing() {
						return $.get(verticalSizing);
					},

					get wispDensity() {
						return $.get(wispDensity);
					},

					get wispSpeed() {
						return $.get(wispSpeed);
					},

					get wispIntensity() {
						return $.get(wispIntensity);
					},

					get flowSpeed() {
						return $.get(flowSpeed);
					},

					get flowStrength() {
						return $.get(flowStrength);
					},

					get fogIntensity() {
						return $.get(fogIntensity);
					},

					get fogScale() {
						return $.get(fogScale);
					},

					get fogFallSpeed() {
						return $.get(fogFallSpeed);
					},

					get decay() {
						return $.get(decay);
					},

					get falloffStart() {
						return $.get(falloffStart);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var div_1 = $.first_child(fragment_2);
					var img = $.sibling(div_1, 2);

					$.bind_this(img, ($$value) => revealImg = $$value, () => revealImg);
					$.template_effect(() => $.set_style(div_1, `position:absolute;top:70%;left:50%;transform:translateX(-50%);width:86%;height:60%;background:#111;border-radius:20px;border:2px solid ${$.get(color) ?? ''};z-index:6;pointer-events:none;`));
					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(selectedExample) === 'box') $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
			$.delegated('mousemove', div, onMove);
			$.event('mouseleave', div, onLeave);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'laser-flow',
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
					var fragment_5 = root_2();
					var node_3 = $.first_child(fragment_5);

					PreviewSelect(node_3, {
						title: 'Demo Example',
						get value() {
							return $.get(selectedExample);
						},

						options: [
							{ label: 'Box', value: 'box' },
							{ label: 'Basic', value: 'basic' }
						],
						onChange: (v) => $.set(selectedExample, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Horizontal Sizing',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(horizontalSizing);
						},
						onChange: (v) => $.set(horizontalSizing, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Vertical Sizing',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(verticalSizing);
						},
						onChange: (v) => $.set(verticalSizing, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Wisp Density',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(wispDensity);
						},
						onChange: (v) => $.set(wispDensity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Wisp Speed',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(wispSpeed);
						},
						onChange: (v) => $.set(wispSpeed, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Wisp Intensity',
						min: 0,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(wispIntensity);
						},
						onChange: (v) => $.set(wispIntensity, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Flow Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(flowSpeed);
						},
						onChange: (v) => $.set(flowSpeed, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Flow Strength',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(flowStrength);
						},
						onChange: (v) => $.set(flowStrength, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Fog Intensity',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(fogIntensity);
						},
						onChange: (v) => $.set(fogIntensity, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Fog Scale',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(fogScale);
						},
						onChange: (v) => $.set(fogScale, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Fog Fall Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(fogFallSpeed);
						},
						onChange: (v) => $.set(fogFallSpeed, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSlider(node_15, {
						title: 'Decay',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(decay);
						},
						onChange: (v) => $.set(decay, v, true)
					});

					var node_16 = $.sibling(node_15, 2);

					PreviewSlider(node_16, {
						title: 'Falloff Start',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(falloffStart);
						},
						onChange: (v) => $.set(falloffStart, v, true)
					});

					$.append($$anchor, fragment_5);
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
			componentName: 'LaserFlow',
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

$.delegate(['mousemove']);