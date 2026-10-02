import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function DisposeMany($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						name: 'box',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
								T_BoxGeometry($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => T.Texture, ($$anchor, T_Texture) => {
											T_Texture($$anchor, { attach: 'map' });
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_3, 2);

							$.component(node_5, () => T.Group, ($$anchor, T_Group_1) => {
								T_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
											T_Mesh_1($$anchor, {
												name: 'plane',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
														T_PlaneGeometry($$anchor, {});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
														T_MeshStandardMaterial($$anchor, {});
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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}