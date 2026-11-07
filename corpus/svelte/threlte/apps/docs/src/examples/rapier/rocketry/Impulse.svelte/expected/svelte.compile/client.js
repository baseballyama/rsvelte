import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { BufferGeometry, DoubleSide, Group, Mesh, Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Impulse($$anchor, $$props) {
	$.push($$props, true);

	let combinedColor = $.derived(() => $$props.color ?? 'red');
	const geometry = new BufferGeometry();
	const tempV3 = new Vector3();
	const startAtObject = new Mesh();
	const endAtObject = new Group();

	useTask(
		() => {
			const from = new Vector3($$props.origin.x, $$props.origin.y, $$props.origin.z);

			if ($$props.length) {
				tempV3.set($$props.impulse.x, $$props.impulse.y, $$props.impulse.z).normalize().multiplyScalar($$props.length);
			} else {
				tempV3.set($$props.impulse.x, $$props.impulse.y, $$props.impulse.z);
			}

			if ($$props.multiplier) {
				tempV3.multiplyScalar($$props.multiplier);
			}

			const to = from.clone().add(tempV3);
			const points = [];

			points.push(from);
			points.push(to);
			geometry.setFromPoints(points);

			if (!startAtObject || !endAtObject) return;

			startAtObject.position.copy(from);
			endAtObject.position.copy(to);
			endAtObject.lookAt(from);
		},
		{ after: $$props.afterTask ?? [] }
	);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.Line, ($$anchor, T_Line) => {
		T_Line($$anchor, {
			renderOrder: 1,
			frustumCulled: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				T(node_1, {
					get is() {
						return geometry;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial) => {
					T_LineBasicMaterial($$anchor, {
						get color() {
							return $.get(combinedColor);
						},
						depthTest: false,
						depthWrite: false,
						get side() {
							return DoubleSide;
						},
						transparent: true,
						opacity: 1
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	T(node_3, {
		get is() {
			return startAtObject;
		},
		frustumCulled: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
				T_SphereGeometry($$anchor, { args: [0.03] });
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
				T_MeshBasicMaterial($$anchor, {
					get color() {
						return $.get(combinedColor);
					},
					depthTest: false,
					depthWrite: false
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	T(node_6, {
		get is() {
			return endAtObject;
		},
		frustumCulled: false,
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_7 = $.first_child(fragment_3);

			$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					'rotation.x': -90 * Math.PI / 180,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_8 = $.first_child(fragment_4);

						$.component(node_8, () => T.ConeGeometry, ($$anchor, T_ConeGeometry) => {
							T_ConeGeometry($$anchor, { args: [0.03, 0.1] });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
							T_MeshBasicMaterial_1($$anchor, {
								get color() {
									return $.get(combinedColor);
								},
								depthTest: false,
								depthWrite: false
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}