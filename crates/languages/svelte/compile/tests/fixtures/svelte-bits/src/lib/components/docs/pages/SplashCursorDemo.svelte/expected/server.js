import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import SplashCursor from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte';
import source from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte?raw';

export default function SplashCursorDemo($$renderer) {
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

	let DENSITY_DISSIPATION = DEFAULTS.DENSITY_DISSIPATION;
	let VELOCITY_DISSIPATION = DEFAULTS.VELOCITY_DISSIPATION;
	let PRESSURE = DEFAULTS.PRESSURE;
	let CURL = DEFAULTS.CURL;
	let SPLAT_RADIUS = DEFAULTS.SPLAT_RADIUS;
	let SPLAT_FORCE = DEFAULTS.SPLAT_FORCE;
	let COLOR_UPDATE_SPEED = DEFAULTS.COLOR_UPDATE_SPEED;
	let SHADING = DEFAULTS.SHADING;
	let RAINBOW_MODE = DEFAULTS.RAINBOW_MODE;
	let COLOR = DEFAULTS.COLOR;
	let renderKey = 0;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => DENSITY_DISSIPATION !== DEFAULTS.DENSITY_DISSIPATION || VELOCITY_DISSIPATION !== DEFAULTS.VELOCITY_DISSIPATION || PRESSURE !== DEFAULTS.PRESSURE || CURL !== DEFAULTS.CURL || SPLAT_RADIUS !== DEFAULTS.SPLAT_RADIUS || SPLAT_FORCE !== DEFAULTS.SPLAT_FORCE || COLOR_UPDATE_SPEED !== DEFAULTS.COLOR_UPDATE_SPEED || SHADING !== DEFAULTS.SHADING || RAINBOW_MODE !== DEFAULTS.RAINBOW_MODE || COLOR !== DEFAULTS.COLOR);

	function rerender() {
		renderKey += 1;
	}

	function reset() {
		DENSITY_DISSIPATION = DEFAULTS.DENSITY_DISSIPATION;
		VELOCITY_DISSIPATION = DEFAULTS.VELOCITY_DISSIPATION;
		PRESSURE = DEFAULTS.PRESSURE;
		CURL = DEFAULTS.CURL;
		SPLAT_RADIUS = DEFAULTS.SPLAT_RADIUS;
		SPLAT_FORCE = DEFAULTS.SPLAT_FORCE;
		COLOR_UPDATE_SPEED = DEFAULTS.COLOR_UPDATE_SPEED;
		SHADING = DEFAULTS.SHADING;
		RAINBOW_MODE = DEFAULTS.RAINBOW_MODE;
		COLOR = DEFAULTS.COLOR;
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

	$.head('152qgo7', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Splash Cursor - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Splash Cursor</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative z-10 flex min-h-[300px] flex-col items-center justify-center overflow-hidden p-0"><p class="select-none text-center text-5xl font-black text-[#333]">Move Your Cursor</p></div> <!---->`);

			{
				SplashCursor($$renderer, {
					DENSITY_DISSIPATION,
					VELOCITY_DISSIPATION,
					PRESSURE,
					CURL,
					SPLAT_RADIUS,
					SPLAT_FORCE,
					COLOR_UPDATE_SPEED,
					SHADING,
					RAINBOW_MODE,
					COLOR
				});
			}

			$$renderer.push(`<!---->`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'splash-cursor', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Density Dissipation',
						min: 0.5,
						max: 10,
						step: 0.5,
						value: DENSITY_DISSIPATION,
						onChange: (v) => {
							DENSITY_DISSIPATION = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Velocity Dissipation',
						min: 0.5,
						max: 10,
						step: 0.5,
						value: VELOCITY_DISSIPATION,
						onChange: (v) => {
							VELOCITY_DISSIPATION = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pressure',
						min: 0,
						max: 1,
						step: 0.05,
						value: PRESSURE,
						onChange: (v) => {
							PRESSURE = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Curl',
						min: 0,
						max: 50,
						step: 1,
						value: CURL,
						onChange: (v) => {
							CURL = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Splat Radius',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: SPLAT_RADIUS,
						onChange: (v) => {
							SPLAT_RADIUS = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Splat Force',
						min: 1000,
						max: 20000,
						step: 500,
						value: SPLAT_FORCE,
						onChange: (v) => {
							SPLAT_FORCE = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Color Update Speed',
						min: 1,
						max: 30,
						step: 1,
						value: COLOR_UPDATE_SPEED,
						onChange: (v) => {
							COLOR_UPDATE_SPEED = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Shading',
						checked: SHADING,
						onChange: (v) => {
							SHADING = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Rainbow Mode',
						checked: RAINBOW_MODE,
						onChange: (v) => {
							RAINBOW_MODE = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					if (!RAINBOW_MODE) {
						$$renderer.push('<!--[0-->');

						PreviewColorPicker($$renderer, {
							title: 'Color',
							value: COLOR,
							onChange: (v) => {
								COLOR = v;
								rerender();
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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
			componentName: 'SplashCursor',
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