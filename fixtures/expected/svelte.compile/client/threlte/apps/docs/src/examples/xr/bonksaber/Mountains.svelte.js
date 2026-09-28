import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Vector2 } from 'three';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Mountains($$anchor, $$props) {
	$.push($$props, true);

	const positions = Array(35).keys().map((index) => {
		const size = Math.random() * 20 + 4;

		return {
			size,
			position: new Vector2(Math.cos(index), Math.sin(index)).subScalar(0.5).normalize().multiplyScalar(100)
		};
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -Math.PI / 2,
			'position.y': -0.1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [100] });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { color: 'rgb(14, 22, 37)' });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.each(node_3, 17, () => positions, $.index, ($$anchor, $$item) => {
		let position = () => $.get($$item).position;
		let size = () => $.get($$item).size;
		var fragment_2 = $.comment();
		var node_4 = $.first_child(fragment_2);

		{
			let $0 = $.derived(() => [position().x, size() / 2 - 1, position().y]);

			$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get position() {
						return $.get($0);
					},
					oncreate: (ref) => ref.lookAt(0, size() / 2, 0),
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								'rotation.z': Math.PI / 2,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_6 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => [size(), 3]);

										$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry_1) => {
											T_CircleGeometry_1($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_7 = $.sibling(node_6, 2);

									Edges(node_7, {});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
										T_MeshBasicMaterial_1($$anchor, { color: 'rgb(14, 22, 37)' });
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
			});
		}

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
	$.pop();
}