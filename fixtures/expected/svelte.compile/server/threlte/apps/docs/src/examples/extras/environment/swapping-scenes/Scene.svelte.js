import * as $ from 'svelte/internal/server';
import { Environment } from '@threlte/extras';
import { Color, PerspectiveCamera, Scene } from 'three';
import { T, useTask, useThrelte } from '@threlte/core';

export default function Scene_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { side = 'left', isBackground = true, useEnvironment = true } = $$props;
		const scenes = { left: new Scene(), right: new Scene() };

		scenes.left.background = new Color('red');
		scenes.right.background = new Color('green');

		const scene = $.derived(() => scenes[side]);
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

		const metalness = 1;
		const roughness = 0;

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { attach: scenes.right });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				attach: scenes.left,
				children: ($$renderer) => {
					if (T.TorusKnotGeometry) {
						$$renderer.push('<!--[-->');
						T.TorusKnotGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { metalness, roughness });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				attach: scenes.right,
				children: ($$renderer) => {
					if (T.TorusKnotGeometry) {
						$$renderer.push('<!--[-->');
						T.TorusKnotGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { metalness, roughness });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (useEnvironment) {
			$$renderer.push('<!--[0-->');

			Environment($$renderer, {
				url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr',
				isBackground,
				scene: scene()
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}