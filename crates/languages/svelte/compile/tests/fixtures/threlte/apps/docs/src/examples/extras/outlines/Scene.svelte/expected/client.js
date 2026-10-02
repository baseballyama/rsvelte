import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Edges, Outlines, useDraco, useGltf } from '@threlte/extras';
import { Mesh, MeshStandardMaterial, MathUtils } from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $helmetGltf = () => $.store_get(helmetGltf, '$helmetGltf', $$stores);
	const $suziGltf = () => $.store_get(suziGltf, '$suziGltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rotation = $.state(0);

	useTask((delta) => {
		$.set(rotation, $.get(rotation) + delta);
	});

	const helmetGltf = useGltf('/models/helmet/DamagedHelmet.gltf');
	const helmetGeometry = $.derived(() => $helmetGltf()?.nodes['node_damagedHelmet_-6514'].geometry);
	const dracoLoader = useDraco();
	const suziGltf = useGltf('/models/Suzanne.glb', { dracoLoader });
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, 'position.z': 20, fov: 20 });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 5, 5] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},
			'position.x': -3,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
								T_TorusKnotGeometry($$anchor, { args: [0.5, 0.15, 128, 64] });
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
								T_MeshToonMaterial($$anchor, { color: '#ff3e00' });
							});

							var node_6 = $.sibling(node_5, 2);

							Outlines(node_6, { color: 'white' });

							var node_7 = $.sibling(node_6, 2);

							Outlines(node_7, { color: 'hotpink', thickness: 0.05 });

							var node_8 = $.sibling(node_7, 2);

							Outlines(node_8, { color: 'yellow', thickness: 0.1 });
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

	var node_9 = $.sibling(node_2, 2);

	$.component(node_9, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_10 = $.first_child(fragment_3);

				{
					var consequent = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_11 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);

							$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_1) => {
								T_Mesh_1($$anchor, {
									get 'rotation.x'() {
										return $.get($0);
									},

									get geometry() {
										return $.get(helmetGeometry);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_12 = $.first_child(fragment_5);

										$.component(node_12, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
											T_MeshBasicMaterial($$anchor, { color: '#ff3e00', toneMapped: false });
										});

										var node_13 = $.sibling(node_12, 2);

										Edges(node_13, { thresholdAngle: 20, color: 'white', scale: 1.01 });

										var node_14 = $.sibling(node_13, 2);

										Outlines(node_14, { color: 'white', thickness: 0.04 });
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_4);
					};

					$.if(node_10, ($$render) => {
						if ($.get(helmetGeometry)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_9, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_16 = $.first_child(fragment_6);

			$.component(node_16, () => T.Group, ($$anchor, T_Group_2) => {
				T_Group_2($$anchor, {
					get 'rotation.y'() {
						return $.get(rotation);
					},
					'position.x': 3,
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_17 = $.first_child(fragment_7);

						$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								get geometry() {
									return $suziGltf().nodes['Suzanne'].geometry;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_18 = $.first_child(fragment_8);

									$.component(node_18, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_1) => {
										T_MeshToonMaterial_1($$anchor, { color: 'turquoise' });
									});

									var node_19 = $.sibling(node_18, 2);

									Outlines(node_19, { color: 'white', screenspace: true, thickness: 3 });
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_15, ($$render) => {
			if ($suziGltf()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}