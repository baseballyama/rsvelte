import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Environment } from '@threlte/extras';
import { Color, PerspectiveCamera, Scene } from 'three';
import { T, useTask, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene_1($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let side = $.prop($$props, 'side', 3, 'left'),
		isBackground = $.prop($$props, 'isBackground', 3, true),
		useEnvironment = $.prop($$props, 'useEnvironment', 3, true);

	const scenes = { left: new Scene(), right: new Scene() };

	scenes.left.background = new Color('red');
	scenes.right.background = new Color('green');

	const scene = $.derived(() => scenes[side()]);
	const { autoRender, renderer, size, renderStage } = useThrelte();

	// scene is split vertically so the aspect needs to be adjusted
	// we could use `useThrelte().camera` here but then we'd have to narrow its type to know if it's a PerspectiveCamera or OrthographicCamera
	const camera = new PerspectiveCamera();

	camera.position.setZ(10);

	useTask(
		() => {
			const halfWidth = 0.5 * size.current.width;

			renderer.setViewport(0, 0, halfWidth, size.current.height);
			renderer.setScissor(0, 0, halfWidth, size.current.height);
			renderer.render(scenes.left, camera);
			renderer.setViewport(halfWidth, 0, halfWidth, size.current.height);
			renderer.setScissor(halfWidth, 0, halfWidth, size.current.height);
			renderer.render(scenes.right, camera);
		},
		{ autoInvalidate: false, stage: renderStage }
	);

	$.user_effect(() => {
		camera.aspect = 0.5 * ($size().width / $size().height);
		camera.updateProjectionMatrix();
	});

	$.user_effect(() => {
		const lastAutoRender = autoRender.current;
		const lastScissorTest = renderer.getScissorTest();

		autoRender.set(false);
		renderer.setScissorTest(true);

		return () => {
			autoRender.set(lastAutoRender);
			renderer.setScissorTest(lastScissorTest);
		};
	});

	const metalness = 1;
	const roughness = 0;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {
			get attach() {
				return scenes.right;
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get attach() {
				return scenes.left;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
					T_TorusKnotGeometry($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { metalness, roughness });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_1, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			get attach() {
				return scenes.right;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry_1) => {
					T_TorusKnotGeometry_1($$anchor, {});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
					T_MeshStandardMaterial_1($$anchor, { metalness, roughness });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_4, 2);

	{
		var consequent = ($$anchor) => {
			Environment($$anchor, {
				url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr',
				get isBackground() {
					return isBackground();
				},

				get scene() {
					return $.get(scene);
				}
			});
		};

		$.if(node_7, ($$render) => {
			if (useEnvironment()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}