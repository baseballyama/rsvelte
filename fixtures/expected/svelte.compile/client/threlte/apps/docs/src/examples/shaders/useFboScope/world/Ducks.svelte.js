import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useGltf, InstancedMeshes, useDraco } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);

export default function Ducks($$anchor, $$props) {
	$.push($$props, true);

	const dracoLoader = useDraco();
	const gltf = useGltf('/models/duck_floaty-transformed.glb', { dracoLoader });
	const duckSpread = 200;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			dispose: false,
			frustumCulled: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.await(
					node_1,
					() => gltf,
					($$anchor) => {
						var fragment_6 = $.comment();
						var node_6 = $.first_child(fragment_6);

						$.snippet(node_6, () => $$props.fallback ?? $.noop);
						$.append($$anchor, fragment_6);
					},
					($$anchor, gltf) => {
						{
							const children = ($$anchor, $$arg0) => {
								let Object_4 = () => ($$arg0?.()).components.Object_4;
								let Object_6 = () => ($$arg0?.()).components.Object_6;
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.each(node_2, 16, () => ({ length: 200 }), $.index, ($$anchor, _) => {
									const posX = $.derived(() => Math.random() * duckSpread - duckSpread / 2);
									const posZ = $.derived(() => Math.random() * duckSpread - 300);
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => T.Group, ($$anchor, T_Group_1) => {
										T_Group_1($$anchor, {
											get 'position.x'() {
												return $.get(posX);
											},

											get 'position.z'() {
												return $.get(posZ);
											},
											scale: 0.1,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, Object_4, ($$anchor, Object_4_1) => {
													Object_4_1($$anchor, { position: [0, 1.59, 2.54], scale: 0.43 });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, Object_6, ($$anchor, Object_6_1) => {
													Object_6_1($$anchor, { position: [0, -0.03, 0] });
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								});

								$.append($$anchor, fragment_3);
							};

							InstancedMeshes($$anchor, {
								get meshes() {
									return $.get(gltf).nodes;
								},
								children,
								$$slots: { default: true }
							});
						}
					}
				);

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}