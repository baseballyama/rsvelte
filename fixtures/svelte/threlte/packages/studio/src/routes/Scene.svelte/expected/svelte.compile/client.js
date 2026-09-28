import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Instance, InstancedMesh, RoundedBoxGeometry } from '@threlte/extras';
import { BaseConfig } from './config.svelte.js';
import { StaticState } from '@threlte/studio';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	class SceneConfig extends StaticState {
		#grid = /**
		 * @min 0
		 * @max 5
		 * @step 1
		 */
		$.state($.proxy({ x: 5, y: 5 }));

		get grid() {
			return $.get(this.#grid);
		}

		set grid(value) {
			$.set(this.#grid, value, true);
		}

		#color = $.state('#fe3d00');

		get color() {
			return $.get(this.#color);
		}

		set color(value) {
			$.set(this.#color, value, true);
		}

		#camera = $.state($.proxy({ x: 0, y: 4, z: 22 }));

		get camera() {
			return $.get(this.#camera);
		}

		set camera(value) {
			$.set(this.#camera, value, true);
		}
	}

	const baseConfig = new BaseConfig();
	const sceneConfig = new SceneConfig();

	const countFloor = $.derived(() => ({
		x: Math.max(Math.floor(sceneConfig.grid.x), 1),
		y: Math.max(Math.floor(sceneConfig.grid.y), 1)
	}));

	const center = $.derived(() => ({
		x: $.get(countFloor).x * -1 + 1,
		y: $.get(countFloor).y * -1 + 1
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [0, 2, 22],
			makeDefault: true,
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 7], intensity: Math.PI });
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => [$.get(center).x, $.get(center).y, 0]);

		$.component(node_2, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					InstancedMesh($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							RoundedBoxGeometry(node_3, { radius: 0.2, args: [1.5, 1.5, 1.5] });

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
								T_MeshStandardMaterial($$anchor, {
									get color() {
										return sceneConfig.color;
									},
									transparent: true,
									get opacity() {
										return baseConfig.opacity;
									},
									alphaToCoverage: true
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.each(node_5, 17, () => ({ length: $.get(countFloor).x }), $.index, ($$anchor, _, i) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.each(node_6, 17, () => ({ length: $.get(countFloor).y }), $.index, ($$anchor, _, j, $$array) => {
									Instance($$anchor, { position: [i * 2, j * 2, 0] });
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}