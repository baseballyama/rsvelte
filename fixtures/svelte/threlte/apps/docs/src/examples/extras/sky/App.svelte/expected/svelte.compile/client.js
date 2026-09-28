import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { Pane, Slider, Checkbox, Button, Folder } from 'svelte-tweakpane-ui';
import { Sky } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { presets } from './presets';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const entries = Object.entries(presets);
	let setEnvironment = $.state(true);
	let azimuth = $.state(0);
	let elevation = $.state(0);
	let exposure = $.state(0);
	let mieCoefficient = $.state(0);
	let mieDirectionalG = $.state(0);
	let rayleigh = $.state(0);
	let turbidity = $.state(0);

	const presetSpring = Spring.of(
		() => ({
			azimuth: $.get(azimuth),
			elevation: $.get(elevation),
			exposure: $.get(exposure),
			mieCoefficient: $.get(mieCoefficient),
			mieDirectionalG: $.get(mieDirectionalG),
			rayleigh: $.get(rayleigh),
			turbidity: $.get(turbidity)
		}),
		{ damping: 0.95, precision: 0.0001, stiffness: 0.05 }
	);

	const applyPreset = (preset) => {
		$.set(azimuth, preset.azimuth, true);
		$.set(elevation, preset.elevation, true);
		$.set(exposure, preset.exposure, true);
		$.set(mieCoefficient, preset.mieCoefficient, true);
		$.set(mieDirectionalG, preset.mieDirectionalG, true);
		$.set(rayleigh, preset.rayleigh, true);
		$.set(turbidity, preset.turbidity, true);
	};

	applyPreset(presets.sunset);

	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Sky',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'Set Environment',
				get value() {
					return $.get(setEnvironment);
				},

				set value($$value) {
					$.set(setEnvironment, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'Turbidity',
				min: 0,
				max: 20,
				get value() {
					return $.get(turbidity);
				},

				set value($$value) {
					$.set(turbidity, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Slider(node_3, {
				label: 'Rayleigh',
				min: 0,
				max: 4,
				get value() {
					return $.get(rayleigh);
				},

				set value($$value) {
					$.set(rayleigh, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Slider(node_4, {
				label: 'Azimuth',
				min: -180,
				max: 180,
				get value() {
					return $.get(azimuth);
				},

				set value($$value) {
					$.set(azimuth, $$value, true);
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Slider(node_5, {
				label: 'Elevation',
				min: -5,
				max: 90,
				get value() {
					return $.get(elevation);
				},

				set value($$value) {
					$.set(elevation, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Slider(node_6, {
				label: 'Mie Coefficient',
				min: 0,
				max: 0.1,
				get value() {
					return $.get(mieCoefficient);
				},

				set value($$value) {
					$.set(mieCoefficient, $$value, true);
				}
			});

			var node_7 = $.sibling(node_6, 2);

			Slider(node_7, {
				label: 'Mie Directional G',
				min: 0,
				max: 1,
				get value() {
					return $.get(mieDirectionalG);
				},

				set value($$value) {
					$.set(mieDirectionalG, $$value, true);
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Slider(node_8, {
				label: 'Exposure',
				min: 0,
				max: 2,
				get value() {
					return $.get(exposure);
				},

				set value($$value) {
					$.set(exposure, $$value, true);
				}
			});

			var node_9 = $.sibling(node_8, 2);

			Folder(node_9, {
				title: 'Presets',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_10 = $.first_child(fragment_2);

					$.each(node_10, 17, () => entries, $.index, ($$anchor, $$item) => {
						var $$array = $.derived(() => $.to_array($.get($$item), 2));
						let title = () => $.get($$array)[0];
						let preset = () => $.get($$array)[1];

						Button($$anchor, {
							get title() {
								return title();
							},

							$$events: {
								click: () => {
									applyPreset(preset());
								}
							}
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node, 2);

	Canvas(node_11, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_12 = $.first_child(fragment_4);

			Sky(node_12, $.spread_props(
				{
					get setEnvironment() {
						return $.get(setEnvironment);
					}
				},
				() => presetSpring.current
			));

			var node_13 = $.sibling(node_12, 2);

			Scene(node_13, {
				get exposure() {
					return presetSpring.current.exposure;
				}
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}