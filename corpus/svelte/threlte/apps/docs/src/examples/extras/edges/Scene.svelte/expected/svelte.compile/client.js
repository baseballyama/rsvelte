import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';
import { Mesh, MeshStandardMaterial, MathUtils } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let rotation = $.state(0);

	useTask((delta) => {
		$.set(rotation, $.get(rotation) + delta);
	});

	const gltf = useGltf('/models/helmet/DamagedHelmet.gltf');
	const helmetGeometry = $.derived(() => $gltf()?.nodes['node_damagedHelmet_-6514'].geometry);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, 'position.z': 10, fov: 20 });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get 'rotation.y'() {
				return $.get(rotation);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);

							$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									get 'rotation.x'() {
										return $.get($0);
									},

									get geometry() {
										return $.get(helmetGeometry);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
											T_MeshBasicMaterial($$anchor, { color: 0xff3e00, toneMapped: false });
										});

										var node_5 = $.sibling(node_4, 2);

										Edges(node_5, { thresholdAngle: 20, color: 'white', scale: 1.01 });
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					};

					$.if(node_2, ($$render) => {
						if ($.get(helmetGeometry)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}