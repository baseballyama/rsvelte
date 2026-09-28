import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { DoubleSide, MathUtils } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [45, 40, -45],
			fov: 90,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true, autoRotateSpeed: 0.1, 'target.y': -10 });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 1 });
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

		$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get 'rotation.x'() {
					return $.get($0);
				},
				castShadow: true,
				receiveShadow: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
						T_PlaneGeometry($$anchor, { args: [1000, 1000] });
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: '#fa992a' });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_5 = $.sibling(node_2, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_6 = $.first_child(fragment_3);

				$.component(node_6, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, { args: [400] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						color: '#0057fa',
						get side() {
							return DoubleSide;
						}
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_5, 2);

	$.each(node_8, 16, () => ({ length: 120 }), $.index, ($$anchor, _, x) => {
		const distance = $.derived(() => Math.abs(Math.sin(x)) * 50 + 10);
		const height = $.derived(() => Math.abs((30 - $.get(distance)) / 2));
		const posX = $.derived(() => $.get(distance) * Math.cos(MathUtils.DEG2RAD * (360 / 120 * x)));
		const posY = $.derived(() => $.get(distance) * Math.sin(MathUtils.DEG2RAD * (360 / 120 * x)));
		var fragment_4 = $.comment();
		var node_9 = $.first_child(fragment_4);

		{
			let $0 = $.derived(() => $.get(height) / 2);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					castShadow: true,
					receiveShadow: true,
					get 'position.x'() {
						return $.get(posX);
					},

					get 'position.y'() {
						return $.get($0);
					},

					get 'position.z'() {
						return $.get(posY);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_10 = $.first_child(fragment_5);

						{
							let $0 = $.derived(() => [3, $.get(height), 12, 32]);

							$.component(node_10, () => T.CapsuleGeometry, ($$anchor, T_CapsuleGeometry) => {
								T_CapsuleGeometry($$anchor, {
									get args() {
										return $.get($0);
									}
								});
							});
						}

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, { color: '#45c1ff' });
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_4);
	});

	$.append($$anchor, fragment);
	$.pop();
}