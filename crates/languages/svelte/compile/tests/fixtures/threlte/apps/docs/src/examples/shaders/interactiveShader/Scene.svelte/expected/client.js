import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import fragmentShader from './fragment.glsl?raw';
import vertexShader from './vertex.glsl?raw';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { OrbitControls } from '@threlte/extras';
import { PlaneGeometry, Vector3 } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { T } from '@threlte/core';
import { Tween } from 'svelte/motion';
import { interactivity } from '@threlte/extras';
import { quadOut } from 'svelte/easing';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	// Terrain setup
	const terrainSize = 30;

	const geometry = new PlaneGeometry(terrainSize, terrainSize, 100, 100);
	const noise = new SimplexNoise();
	const vertices = geometry.getAttribute('position');

	for (let i = 0; i < vertices.count; i += 1) {
		const x = vertices.getX(i);
		const y = vertices.getY(i);

		vertices.setZ(i, noise.noise(x / 5, y / 5) * 2 + noise.noise(x / 40, y / 40) * 3);
	}

	geometry.computeVertexNormals();

	// Interactivity and shader variables
	interactivity();

	const pulsePosition = new Vector3();
	const pulseTimer = new Tween(0, { easing: quadOut });
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-70, 50, 10],
			fov: 15,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { 'target.y': 1.5, autoRotateSpeed: 0.2 });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => DEG2RAD * -90);

		$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get geometry() {
					return geometry;
				},

				get 'rotation.x'() {
					return $.get($0);
				},

				onclick: ({ point }) => {
					pulsePosition.copy(point);

					pulseTimer.set(0, { duration: 0 }).then(() => {
						pulseTimer.set(1, { duration: 2000 });
					});
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial) => {
						T_ShaderMaterial($$anchor, {
							get fragmentShader() {
								return fragmentShader;
							},

							get vertexShader() {
								return vertexShader;
							},
							uniforms: { pulseTimer: { value: 0 }, pulsePosition: { value: 0 } },
							get 'uniforms.pulseTimer.value'() {
								return pulseTimer.current;
							},

							get 'uniforms.pulsePosition.value'() {
								return pulsePosition;
							}
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}