import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Text } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Pad($$anchor, $$props) {
	let active = $.prop($$props, 'active', 3, false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			get onclick() {
				return $$props.onclick;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						'position.y': 0.012,
						'rotation.x': -Math.PI / 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
								T_CircleGeometry($$anchor, { args: [0.38, 48] });
							});

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => active() ? $$props.color : '#111827');
								let $1 = $.derived(() => active() ? 1.1 : 0.25);

								$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, {
										get color() {
											return $.get($0);
										},

										get emissive() {
											return $$props.color;
										},

										get emissiveIntensity() {
											return $.get($1);
										},
										metalness: 0.1,
										roughness: 0.4
									});
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						'position.y': 0.13,
						castShadow: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
								T_CylinderGeometry($$anchor, { args: [0.055, 0.055, 0.26, 24] });
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
								T_MeshStandardMaterial_1($$anchor, {
									get color() {
										return $$props.color;
									},

									get emissive() {
										return $$props.color;
									},
									emissiveIntensity: 0.2,
									metalness: 0.2,
									roughness: 0.45
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_4, 2);

				$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_2) => {
					T_Mesh_2($$anchor, {
						'position.y': 0.021,
						'rotation.x': -Math.PI / 2,
						raycast: () => false,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_8 = $.first_child(fragment_4);

							$.component(node_8, () => T.RingGeometry, ($$anchor, T_RingGeometry) => {
								T_RingGeometry($$anchor, { args: [0.11, 0.15, 32] });
							});

							var node_9 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => active() ? '#ecfeff' : '#d1d5db');
								let $1 = $.derived(() => active() ? '#67e8f9' : '#374151');
								let $2 = $.derived(() => active() ? 0.8 : 0.1);

								$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
									T_MeshStandardMaterial_2($$anchor, {
										get color() {
											return $.get($0);
										},

										get emissive() {
											return $.get($1);
										},

										get emissiveIntensity() {
											return $.get($2);
										},
										side: 2
									});
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_7, 2);

				{
					let $0 = $.derived(() => active() ? '#f9fafb' : '#d1d5db');

					Text(node_10, {
						get color() {
							return $.get($0);
						},
						fontSize: 0.11,
						anchorX: 'center',
						anchorY: 'bottom',
						position: [0, 0.32, 0],
						raycast: () => false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $$props.label));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}