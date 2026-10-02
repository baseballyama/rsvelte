import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CounterLabel from './CounterLabel.svelte';
import CssObject from './CssObject.svelte';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { autoRenderTask, camera, scene, size } = useThrelte();

	// note that the renderer won't be reactive if `element` updates
	// you'd have to do `$derived(new CSS2DRenderer({element}))` if you'd want that to be the case
	const cssRenderer = new CSS2DRenderer({ element: $$props.element });

	$.user_effect(() => {
		cssRenderer.setSize($size().width, $size().height);
	});

	// We are running two renderers, and don't want to run
	// updateMatrixWorld twice; tell the renderers that we'll handle
	// it manually.
	// https://threejs.org/docs/#api/en/core/Object3D.updateWorldMatrix
	const last = scene.matrixWorldAutoUpdate;

	scene.matrixWorldAutoUpdate = false;

	$.user_effect(() => {
		return () => {
			scene.matrixWorldAutoUpdate = last;
		};
	});

	// To update the matrices *once* per frame, we'll use a task that is added
	// right before the autoRenderTask. This way, we can be sure that the
	// matrices are updated before the renderers run.
	useTask(
		() => {
			scene.updateMatrixWorld();
		},
		{ before: autoRenderTask }
	);

	// The CSS2DRenderer needs to be updated after the autoRenderTask, so we
	// add a task that runs after it.
	useTask(
		() => {
			// Update the DOM
			cssRenderer.render(scene, camera.current);
		},
		{ after: autoRenderTask, autoInvalidate: false }
	);

	const params = [
		{ color: '#4F6FF6', label: 'Hello', position: [-1, 2, 1] },
		{ color: '#6FF64F', label: 'CSS', position: [1, 2, 1] },
		{ color: '#F64F6F', label: 'Renderer', position: [1, 2, -1] }
	];

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 5, 5],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 10, 10] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 1,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [2, 2, 2] });
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#F64F6F' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_2, 2);

	$.each(node_5, 17, () => params, $.index, ($$anchor, $$item) => {
		let color = () => $.get($$item).color;
		let label = () => $.get($$item).label;
		let position = () => $.get($$item).position;

		{
			const content = ($$anchor) => {
				CounterLabel($$anchor, {
					get label() {
						return label();
					}
				});
			};

			CssObject($$anchor, {
				get position() {
					return position();
				},
				center: [0, 0.5],
				content,
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_6 = $.first_child(fragment_5);

					$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_7 = $.first_child(fragment_6);

								$.component(node_7, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
									T_SphereGeometry($$anchor, { args: [0.25] });
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, {
										get color() {
											return color();
										}
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { content: true, default: true }
			});
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}