import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

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
	$.user_effect(() => {
		return () => {
			quad.dispose();
			material.dispose();
		};
	});

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

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { scene } = $.get($$source);

			return { scene };
		});

		var scene = $.derived(() => $.get($$value).scene);

		T($$anchor, {
			get is() {
				return $.get(scene);
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	Environment(node_2, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr',
		isBackground: true
	});

	$.append($$anchor, fragment);
	$.pop();
}