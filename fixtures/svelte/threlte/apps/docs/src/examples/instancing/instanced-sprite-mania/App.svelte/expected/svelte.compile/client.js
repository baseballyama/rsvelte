import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { Canvas, T } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';
import { OrbitControls } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-q41xwf"><!> <!></div>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.state(true);
	let fps = $.state(9);
	var div = root_1();
	var node = $.child(div);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.z': 14,
					'position.y': 4,
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => MathUtils.DEG2RAD * 65);
							let $1 = $.derived(() => MathUtils.DEG2RAD * 85);

							OrbitControls($$anchor, {
								autoRotate: true,
								autoRotateSpeed: 0.5,
								get minPolarAngle() {
									return $.get($0);
								},

								get maxPolarAngle() {
									return $.get($1);
								}
							});
						}
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			Scene(node_2, {
				get billboarding() {
					return $.get(billboarding);
				},

				get fps() {
					return $.get(fps);
				}
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Settings(node_3, {
		get billboarding() {
			return $.get(billboarding);
		},

		set billboarding($$value) {
			$.set(billboarding, $$value, true);
		},

		get fps() {
			return $.get(fps);
		},

		set fps($$value) {
			$.set(fps, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}