import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Slider, Checkbox, Color } from 'svelte-tweakpane-ui';
import { Canvas, T } from '@threlte/core';
import { CSM } from '@threlte/extras';
import Scene from './Scene.svelte';

var root = $.from_html(`<!>  <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="svelte-1ldcvyn"><!></div>`, 1);

export default function App($$anchor) {
	let enabled = $.state(true);
	let lightDirection = { x: 1, y: -1, z: 1 };
	let lightIntensity = $.state($.proxy(Math.PI));
	let lightColor = $.state('#fffceb');
	var fragment = root_1();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'CSM',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'CSM enabled',
				get value() {
					return $.get(enabled);
				},

				set value($$value) {
					$.set(enabled, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Slider(node_2, {
				label: 'lightIntensity',
				min: 0,
				max: 10,
				get value() {
					return $.get(lightIntensity);
				},

				set value($$value) {
					$.set(lightIntensity, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Color(node_3, {
				label: 'lightColor',
				get value() {
					return $.get(lightColor);
				},

				set value($$value) {
					$.set(lightColor, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_4 = $.child(div);

	Canvas(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				const fallback = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.component(node_5, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
						T_DirectionalLight($$anchor, { castShadow: false });
					});

					$.append($$anchor, fragment_3);
				};

				let $0 = $.derived(() => [lightDirection.x, lightDirection.y, lightDirection.z]);

				CSM($$anchor, {
					get enabled() {
						return $.get(enabled);
					},

					get lightDirection() {
						return $.get($0);
					},

					get lightIntensity() {
						return $.get(lightIntensity);
					},

					get lightColor() {
						return $.get(lightColor);
					},
					fallback,
					children: ($$anchor, $$slotProps) => {
						Scene($$anchor, {});
					},
					$$slots: { fallback: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}