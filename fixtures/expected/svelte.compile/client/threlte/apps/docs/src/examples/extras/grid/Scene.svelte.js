import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BoxGeometry, Vector2 } from 'three';
import { Gizmo, OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const positions = [];
	const count = 4;

	for (let j = 0; j < count; j += 1) {
		for (let i = 0; i < count; i += 1) {
			positions.push(new Vector2(i, j).multiplyScalar(2).subScalar(3));
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: 15,
			fov: 60,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Gizmo($$anchor, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => positions, $.index, ($$anchor, $$item) => {
		let x = () => $.get($$item).x;
		let y = () => $.get($$item).y;
		var fragment_3 = $.comment();
		var node_2 = $.first_child(fragment_3);

		{
			let $0 = $.derived(() => [x(), 0.5, y()]);

			$.component(node_2, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get position() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, {});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
										T_MeshBasicMaterial($$anchor, { color: 'white', opacity: 0.9, transparent: true });
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_3, 2);

						$.component(node_6, () => T.LineSegments, ($$anchor, T_LineSegments) => {
							T_LineSegments($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => [new BoxGeometry()]);

										$.component(node_7, () => T.EdgesGeometry, ($$anchor, T_EdgesGeometry) => {
											T_EdgesGeometry($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial) => {
										T_LineBasicMaterial($$anchor, { color: 'black', linewidth: 2 });
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_3);
	});

	$.append($$anchor, fragment);
	$.pop();
}