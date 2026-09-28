import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { SheetObject } from '$lib/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [3, 3, 3],
			makeDefault: true,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let Transform = () => ($$arg0?.()).Transform;
			let Sync = () => ($$arg0?.()).Sync;
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, Transform, ($$anchor, Transform_1) => {
				Transform_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								receiveShadow: true,
								castShadow: true,
								'position.y': 0.5,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, {});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, {
											color: 'hotpink',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, Sync, ($$anchor, Sync_1) => {
													Sync_1($$anchor, { color: true, roughness: true, metalness: true });
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
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
			});

			$.append($$anchor, fragment_2);
		};

		SheetObject(node_1, { key: 'Box', children, $$slots: { default: true } });
	}

	var node_7 = $.sibling(node_1, 2);

	$.component(node_7, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	$.append($$anchor, fragment);
}