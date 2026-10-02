import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 5, 5],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [3, 10, 7] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let Transform = () => ($$arg0?.()).Transform;
			let Sync = () => ($$arg0?.()).Sync;
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			$.component(node_4, Transform, ($$anchor, Transform_1) => {
				Transform_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_5 = $.first_child(fragment_2);

						$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								'position.y': 0.5,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_6 = $.first_child(fragment_3);

									$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, {});
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, {
											color: '#ff3e00',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_8 = $.first_child(fragment_4);

												$.component(node_8, Sync, ($$anchor, Sync_1) => {
													Sync_1($$anchor, { color: true });
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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		SheetObject(node_3, { key: 'Box', children, $$slots: { default: true } });
	}

	var node_9 = $.sibling(node_3, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_10 = $.first_child(fragment_5);

				$.component(node_10, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [4, 48] });
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { color: 'white' });
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}