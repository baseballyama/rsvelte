import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import SplashCursor from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte';
import source from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte?raw';

var root = $.from_html(`<div class="demo-container relative z-10 flex min-h-[300px] flex-col items-center justify-center overflow-hidden p-0"><p class="select-none text-center text-5xl font-black text-[#333]">Move Your Cursor</p></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Splash Cursor</h1> <!>`, 1);

export default function SplashCursorDemo($$anchor) {
	const DEFAULTS = {
		DENSITY_DISSIPATION: 3.5,
		VELOCITY_DISSIPATION: 2,
		PRESSURE: 0.1,
		CURL: 3,
		SPLAT_RADIUS: 0.2,
		SPLAT_FORCE: 6000,
		COLOR_UPDATE_SPEED: 10,
		SHADING: true,
		RAINBOW_MODE: false,
		COLOR: '#FF3E00'
	};

	let DENSITY_DISSIPATION = $.state($.proxy(DEFAULTS.DENSITY_DISSIPATION));
	let VELOCITY_DISSIPATION = $.state($.proxy(DEFAULTS.VELOCITY_DISSIPATION));
	let PRESSURE = $.state($.proxy(DEFAULTS.PRESSURE));
	let CURL = $.state($.proxy(DEFAULTS.CURL));
	let SPLAT_RADIUS = $.state($.proxy(DEFAULTS.SPLAT_RADIUS));
	let SPLAT_FORCE = $.state($.proxy(DEFAULTS.SPLAT_FORCE));
	let COLOR_UPDATE_SPEED = $.state($.proxy(DEFAULTS.COLOR_UPDATE_SPEED));
	let SHADING = $.state($.proxy(DEFAULTS.SHADING));
	let RAINBOW_MODE = $.state($.proxy(DEFAULTS.RAINBOW_MODE));
	let COLOR = $.state($.proxy(DEFAULTS.COLOR));
	let renderKey = $.state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(DENSITY_DISSIPATION) !== DEFAULTS.DENSITY_DISSIPATION || $.get(VELOCITY_DISSIPATION) !== DEFAULTS.VELOCITY_DISSIPATION || $.get(PRESSURE) !== DEFAULTS.PRESSURE || $.get(CURL) !== DEFAULTS.CURL || $.get(SPLAT_RADIUS) !== DEFAULTS.SPLAT_RADIUS || $.get(SPLAT_FORCE) !== DEFAULTS.SPLAT_FORCE || $.get(COLOR_UPDATE_SPEED) !== DEFAULTS.COLOR_UPDATE_SPEED || $.get(SHADING) !== DEFAULTS.SHADING || $.get(RAINBOW_MODE) !== DEFAULTS.RAINBOW_MODE || $.get(COLOR) !== DEFAULTS.COLOR);

	function rerender() {
		$.set(renderKey, $.get(renderKey) + 1);
	}

	function reset() {
		$.set(DENSITY_DISSIPATION, DEFAULTS.DENSITY_DISSIPATION, true);
		$.set(VELOCITY_DISSIPATION, DEFAULTS.VELOCITY_DISSIPATION, true);
		$.set(PRESSURE, DEFAULTS.PRESSURE, true);
		$.set(CURL, DEFAULTS.CURL, true);
		$.set(SPLAT_RADIUS, DEFAULTS.SPLAT_RADIUS, true);
		$.set(SPLAT_FORCE, DEFAULTS.SPLAT_FORCE, true);
		$.set(COLOR_UPDATE_SPEED, DEFAULTS.COLOR_UPDATE_SPEED, true);
		$.set(SHADING, DEFAULTS.SHADING, true);
		$.set(RAINBOW_MODE, DEFAULTS.RAINBOW_MODE, true);
		$.set(COLOR, DEFAULTS.COLOR, true);
		rerender();
	}

	const usage = $.derived(() => `${scriptOpen}
  import SplashCursor from '$lib/components/SplashCursor.svelte';
${scriptClose}

<SplashCursor />`);

	const props = [
		{
			name: 'SIM_RESOLUTION',
			type: 'number',
			default: '128',
			description: 'Fluid simulation resolution for velocity fields.'
		},

		{
			name: 'DYE_RESOLUTION',
			type: 'number',
			default: '1440',
			description: 'Resolution of the color/dye texture.'
		},

		{
			name: 'CAPTURE_RESOLUTION',
			type: 'number',
			default: '512',
			description: 'Resolution used for certain capture operations.'
		},

		{
			name: 'DENSITY_DISSIPATION',
			type: 'number',
			default: '3.5',
			description: 'Rate at which color/density dissipates over time.'
		},

		{
			name: 'VELOCITY_DISSIPATION',
			type: 'number',
			default: '2',
			description: 'Rate at which velocity dissipates over time.'
		},

		{
			name: 'PRESSURE',
			type: 'number',
			default: '0.1',
			description: 'Base pressure for the fluid simulation.'
		},

		{
			name: 'PRESSURE_ITERATIONS',
			type: 'number',
			default: '20',
			description: 'Number of Jacobi iterations used for the pressure solver.'
		},

		{
			name: 'CURL',
			type: 'number',
			default: '3',
			description: 'Amount of vorticity/curl to apply for swirling effects.'
		},

		{
			name: 'SPLAT_RADIUS',
			type: 'number',
			default: '0.2',
			description: "Radius of the 'splat' effect when user interacts."
		},

		{
			name: 'SPLAT_FORCE',
			type: 'number',
			default: '6000',
			description: "Force of the fluid 'splat' on each interaction."
		},

		{
			name: 'SHADING',
			type: 'boolean',
			default: 'true',
			description: 'Toggles simple lighting/shading on the fluid.'
		},

		{
			name: 'COLOR_UPDATE_SPEED',
			type: 'number',
			default: '10',
			description: 'Frequency at which pointer colors are re-randomized.'
		},

		{
			name: 'RAINBOW_MODE',
			type: 'boolean',
			default: 'true',
			description: 'When true, uses randomly cycling rainbow colors. When false, uses COLOR.'
		},

		{
			name: 'COLOR',
			type: 'string',
			default: "'#ff0000'",
			description: 'Hex color for the cursor effect when RAINBOW_MODE is false.'
		},

		{
			name: 'BACK_COLOR',
			type: 'object',
			default: '{ r: 0.5, g: 0, b: 0 }',
			description: 'Base background color. Not always used if TRANSPARENT is true.'
		},

		{
			name: 'TRANSPARENT',
			type: 'boolean',
			default: 'true',
			description: 'Whether the canvas renders with transparent background.'
		}
	];

	var fragment = root_2();

	$.head('152qgo7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Splash Cursor - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			$.key(node_1, () => $.get(renderKey), ($$anchor) => {
				SplashCursor($$anchor, {
					get DENSITY_DISSIPATION() {
						return $.get(DENSITY_DISSIPATION);
					},

					get VELOCITY_DISSIPATION() {
						return $.get(VELOCITY_DISSIPATION);
					},

					get PRESSURE() {
						return $.get(PRESSURE);
					},

					get CURL() {
						return $.get(CURL);
					},

					get SPLAT_RADIUS() {
						return $.get(SPLAT_RADIUS);
					},

					get SPLAT_FORCE() {
						return $.get(SPLAT_FORCE);
					},

					get COLOR_UPDATE_SPEED() {
						return $.get(COLOR_UPDATE_SPEED);
					},

					get SHADING() {
						return $.get(SHADING);
					},

					get RAINBOW_MODE() {
						return $.get(RAINBOW_MODE);
					},

					get COLOR() {
						return $.get(COLOR);
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'splash-cursor',
				usage: $.get(usage),
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_2 = $.first_child(fragment_5);

					PreviewSlider(node_2, {
						title: 'Density Dissipation',
						min: 0.5,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(DENSITY_DISSIPATION);
						},

						onChange: (v) => {
							$.set(DENSITY_DISSIPATION, v, true);
							rerender();
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Velocity Dissipation',
						min: 0.5,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(VELOCITY_DISSIPATION);
						},

						onChange: (v) => {
							$.set(VELOCITY_DISSIPATION, v, true);
							rerender();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Pressure',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(PRESSURE);
						},

						onChange: (v) => {
							$.set(PRESSURE, v, true);
							rerender();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Curl',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(CURL);
						},

						onChange: (v) => {
							$.set(CURL, v, true);
							rerender();
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Splat Radius',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(SPLAT_RADIUS);
						},

						onChange: (v) => {
							$.set(SPLAT_RADIUS, v, true);
							rerender();
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Splat Force',
						min: 1000,
						max: 20000,
						step: 500,
						get value() {
							return $.get(SPLAT_FORCE);
						},

						onChange: (v) => {
							$.set(SPLAT_FORCE, v, true);
							rerender();
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Color Update Speed',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(COLOR_UPDATE_SPEED);
						},

						onChange: (v) => {
							$.set(COLOR_UPDATE_SPEED, v, true);
							rerender();
						}
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Shading',
						get checked() {
							return $.get(SHADING);
						},

						onChange: (v) => {
							$.set(SHADING, v, true);
							rerender();
						}
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Rainbow Mode',
						get checked() {
							return $.get(RAINBOW_MODE);
						},

						onChange: (v) => {
							$.set(RAINBOW_MODE, v, true);
							rerender();
						}
					});

					var node_11 = $.sibling(node_10, 2);

					{
						var consequent = ($$anchor) => {
							PreviewColorPicker($$anchor, {
								title: 'Color',
								get value() {
									return $.get(COLOR);
								},

								onChange: (v) => {
									$.set(COLOR, v, true);
									rerender();
								}
							});
						};

						$.if(node_11, ($$render) => {
							if (!$.get(RAINBOW_MODE)) $$render(consequent);
						});
					}

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
			componentName: 'SplashCursor',
			usage: $.get(usage),
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