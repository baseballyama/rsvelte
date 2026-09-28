import * as $ from 'svelte/internal/server';
import { Environment, OrbitControls, useFBO, useGltf } from '@threlte/extras';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { ShaderMaterial, Uniform } from 'three';
import { T, useTask, useThrelte } from '@threlte/core';

const vertexShader = `
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
`;

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { camera, renderStage, renderer, scene } = useThrelte();
		const target = useFBO();

		/**
		 * put your interesting effects in this shader.
		 */
		const fragmentShader = `
		uniform sampler2D uScene;
		uniform float uTime;

		varying vec2 vUv;

		void main() {

			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

			vec2 center = vec2(0.5, 0.5);

			float radius = 1.0 - 0.5 * (1.0 + sin(uTime));

			if (length(center - vUv) - radius < 0.0) {
				gl_FragColor = texture2D(uScene, vUv);
			}
		}
	`;

		const gltf = useGltf('/models/spaceships/Bob.gltf');
		const uScene = new Uniform(target.texture);
		const uTime = new Uniform(0);

		useTask((delta) => {
			uTime.value += delta;
		});

		const material = new ShaderMaterial({ fragmentShader, uniforms: { uScene, uTime }, vertexShader });
		const quad = new FullScreenQuad(material);

		// not using the <T> component so we need to clean up after ourselves
		useTask(
			() => {
				const last = renderer.getRenderTarget();

				renderer.setRenderTarget(target);
				renderer.render(scene, camera.current);
				renderer.setRenderTarget(last);
				quad.render(renderer);
			},
			{ stage: renderStage }
		);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: 5,
				children: ($$renderer) => {
					OrbitControls($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, gltf, () => {}, ({ scene }) => {
			T($$renderer, { is: scene });
		});

		$$renderer.push(`<!--]--> `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr',
			isBackground: true
		});

		$$renderer.push(`<!---->`);
	});
}