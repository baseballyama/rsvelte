import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { useFBO, useTexture } from '@threlte/extras';
import { Group, PerspectiveCamera, ShaderMaterial, Texture, Uniform } from 'three';
import { baseFov, scoping, zoomedFov } from '../Controls.svelte';
import fragmentShader from './scope_fs.glsl?raw';
import vertexShader from './scope_vs.glsl?raw';

var root = $.from_html(`<!> <!>`, 1);

export default function LensView($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const $scoping = () => $.store_get(scoping, '$scoping', $$stores);
	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const $reticleTexture = () => $.store_get(reticleTexture, '$reticleTexture', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { camera, renderer, scene, size } = useThrelte();
	let scope = $.prop($$props, 'scope', 15);

	// render scene at a lower resolution but multiple samples for antialiasing
	const renderTarget = useFBO({
		size: { width: $size().width * 0.5, height: $size().height * 0.5 },
		samples: 8
	});

	const uniforms = {
		viewTexture: new Uniform(renderTarget.texture),
		reticleTexture: new Uniform(null),
		aspect: new Uniform(1)
	};

	const material = new ShaderMaterial({ fragmentShader, vertexShader, uniforms });

	useTask(() => {
		if (!scope() || !$scoping()) return;

		const cam = $camera();

		scope(scope().visible = false, true);
		cam.fov = zoomedFov.current;
		cam.updateProjectionMatrix();
		cam.matrixWorldNeedsUpdate = true;
		renderer.setRenderTarget(renderTarget);
		renderer.render(scene, cam);
		renderer.setRenderTarget(null);
		cam.fov = baseFov;
		cam.updateProjectionMatrix();
		scope(scope().visible = true, true);
	});

	const reticleTexture = useTexture('/textures/NightforceScopeReticle2.png');

	$.user_effect(() => {
		uniforms.reticleTexture.value = $reticleTexture() || null;
	});

	$.user_effect(() => {
		uniforms.aspect.value = size.current.width / size.current.height;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.z': 19.5,
			'position.y': -0.1,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [1.8] });
				});

				var node_2 = $.sibling(node_1, 2);

				T(node_2, {
					get is() {
						return material;
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}