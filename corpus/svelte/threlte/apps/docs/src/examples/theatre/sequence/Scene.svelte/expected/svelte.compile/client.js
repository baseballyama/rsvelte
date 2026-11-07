import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { SheetObject } from '@threlte/theatre';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let Transform = () => ($$arg0?.()).Transform;
			let Sync = () => ($$arg0?.()).Sync;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, Transform, ($$anchor, Transform_1) => {
				Transform_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								receiveShadow: true,
								castShadow: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, { args: [1, 1, 1] });
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, Sync, ($$anchor, Sync_1) => {
													Sync_1($$anchor, { color: true, emissive: true });
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

		SheetObject(node, { key: 'Box', children, $$slots: { default: true } });
	}

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0.5, 2, 1], castShadow: true });
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [4, 5, 10],
			makeDefault: true,
			oncreate: (ref) => {
				ref.lookAt(0, 0.5, 0);
			}
		});
	});

	$.append($$anchor, fragment);
}