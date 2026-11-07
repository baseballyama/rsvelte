import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { interactivity, useCursor, useViewport } from '@threlte/extras';
import { Mesh, Quaternion } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function HudScene($$anchor, $$props) {
	$.push($$props, true);

	const $viewport = () => $.store_get(viewport, '$viewport', $$stores);
	const $boxHovering = () => $.store_get(boxHovering, '$boxHovering', $$stores);
	const $torusHovering = () => $.store_get(torusHovering, '$torusHovering', $$stores);
	const $torusKnotHovering = () => $.store_get(torusKnotHovering, '$torusKnotHovering', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const viewport = useViewport();
	let meshes = [null, null, null];
	const boxCursor = useCursor();
	const torusCursor = useCursor();
	const torusKnotCursor = useCursor();

	interactivity();

	useTask(
		() => {
			for (const mesh of meshes) {
				mesh.quaternion.copy($$props.quaternion);
			}
		},
		{ autoInvalidate: false }
	);

	const boxHovering = boxCursor.hovering;
	const torusHovering = torusCursor.hovering;
	const torusKnotHovering = torusKnotCursor.hovering;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, { makeDefault: true, zoom: 80, position: [0, 0, 10] });
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: Math.PI / 2 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.PointLight, ($$anchor, T_PointLight) => {
		T_PointLight($$anchor, { position: [10, 10, 10], decay: 0, intensity: Math.PI * 2 });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => [$viewport().width / 2 - 1, $viewport().height / 2 - 1, 0]);
		let $1 = $.derived(() => $boxHovering() ? 1.1 : 1);

		$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get position() {
					return $.get($0);
				},

				get onpointerenter() {
					return boxCursor.onPointerEnter;
				},

				get onpointerleave() {
					return boxCursor.onPointerLeave;
				},
				onclick: () => $$props.onselect('box'),
				get scale() {
					return $.get($1);
				},

				get ref() {
					return meshes[0];
				},

				set ref($$value) {
					meshes[0] = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_4 = $.first_child(fragment_1);

					$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
						T_BoxGeometry($$anchor, { args: [0.5, 0.5, 0.5] });
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => $boxHovering() ? 'hotpink' : 'gray');

						$.component(node_5, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
							T_MeshToonMaterial($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_6 = $.sibling(node_3, 2);

	{
		let $0 = $.derived(() => [$viewport().width / 2 - 2, $viewport().height / 2 - 1, 0]);
		let $1 = $.derived(() => $torusHovering() ? 1.1 : 1);

		$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
			T_Mesh_1($$anchor, {
				get position() {
					return $.get($0);
				},

				get onpointerenter() {
					return torusCursor.onPointerEnter;
				},

				get onpointerleave() {
					return torusCursor.onPointerLeave;
				},
				onclick: () => $$props.onselect('torus'),
				get scale() {
					return $.get($1);
				},

				get ref() {
					return meshes[1];
				},

				set ref($$value) {
					meshes[1] = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_7 = $.first_child(fragment_2);

					$.component(node_7, () => T.TorusGeometry, ($$anchor, T_TorusGeometry) => {
						T_TorusGeometry($$anchor, { args: [0.25, 0.1] });
					});

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => $torusHovering() ? 'hotpink' : 'gray');

						$.component(node_8, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_1) => {
							T_MeshToonMaterial_1($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_9 = $.sibling(node_6, 2);

	{
		let $0 = $.derived(() => [$viewport().width / 2 - 3, $viewport().height / 2 - 1, 0]);
		let $1 = $.derived(() => $torusKnotHovering() ? 1.1 : 1);

		$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
			T_Mesh_2($$anchor, {
				get position() {
					return $.get($0);
				},

				get onpointerover() {
					return torusKnotCursor.onPointerEnter;
				},

				get onpointerleave() {
					return torusKnotCursor.onPointerLeave;
				},
				onclick: () => $$props.onselect('torusknot'),
				get scale() {
					return $.get($1);
				},

				get ref() {
					return meshes[2];
				},

				set ref($$value) {
					meshes[2] = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_10 = $.first_child(fragment_3);

					$.component(node_10, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
						T_TorusKnotGeometry($$anchor, { args: [0.215, 0.08, 256] });
					});

					var node_11 = $.sibling(node_10, 2);

					{
						let $0 = $.derived(() => $torusKnotHovering() ? 'hotpink' : 'gray');

						$.component(node_11, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_2) => {
							T_MeshToonMaterial_2($$anchor, {
								get color() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}