import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';
import { useFBO, useTexture } from '@threlte/extras';
import { Group, PerspectiveCamera, ShaderMaterial, Texture, Uniform } from 'three';
import { baseFov, scoping, zoomedFov } from '../Controls.svelte';
import fragmentShader from './scope_fs.glsl?raw';
import vertexShader from './scope_vs.glsl?raw';

export default function LensView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { camera, renderer, scene, size } = useThrelte();
		let { scope = void 0 } = $$props;

		// render scene at a lower resolution but multiple samples for antialiasing
		const renderTarget = useFBO({
			size: {
				width: $.store_get($$store_subs ??= {}, '$size', size).width * 0.5,
				height: $.store_get($$store_subs ??= {}, '$size', size).height * 0.5
			},
			samples: 8
		});

		const uniforms = {
			viewTexture: new Uniform(renderTarget.texture),
			reticleTexture: new Uniform(null),
			aspect: new Uniform(1)
		};

		const material = new ShaderMaterial({ fragmentShader, vertexShader, uniforms });

		useTask(() => {
			if (!scope || !$.store_get($$store_subs ??= {}, '$scoping', scoping)) return;

			const cam = $.store_get($$store_subs ??= {}, '$camera', camera);

			scope.visible = false;
			cam.fov = zoomedFov.current;
			cam.updateProjectionMatrix();
			cam.matrixWorldNeedsUpdate = true;
			renderer.setRenderTarget(renderTarget);
			renderer.render(scene, cam);
			renderer.setRenderTarget(null);
			cam.fov = baseFov;
			cam.updateProjectionMatrix();
			scope.visible = true;
		});

		const reticleTexture = useTexture('/textures/NightforceScopeReticle2.png');

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.z': 19.5,
				'position.y': -0.1,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [1.8] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					T($$renderer, { is: material });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { scope });
	});
}