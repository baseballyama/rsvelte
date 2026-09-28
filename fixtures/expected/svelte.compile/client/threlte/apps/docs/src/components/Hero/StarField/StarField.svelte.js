import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { untrack } from 'svelte';

import {
	BufferGeometry,
	Float32BufferAttribute,
	PointsMaterial,
	Vector3
} from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function StarField($$anchor, $$props) {
	$.push($$props, true);

	let amount = $.prop($$props, 'amount', 3, 100),
		radius = $.prop($$props, 'radius', 3, 100),
		color = $.prop($$props, 'color', 3, '#ffffff'),
		opacity = $.prop($$props, 'opacity', 3, 1),
		size = $.prop($$props, 'size', 3, 0.1),
		speed = $.prop($$props, 'speed', 3, 1),
		direction = $.prop($$props, 'direction', 19, () => [0, 0, 1]);

	const geometry = new BufferGeometry();
	const diameter = $.derived(() => radius() * 2);

	untrack(() => {
		const vertices = [];

		for (let i = 0; i < amount(); i++) {
			const x = Math.random() * $.get(diameter) - radius();
			const y = Math.random() * $.get(diameter) - radius();
			const z = Math.random() * $.get(diameter) - radius();

			vertices.push(x, y, z);
		}

		geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
	});

	const material = new PointsMaterial({ transparent: true });

	const settings = {
		elapsedTime: 0,
		direction: new Vector3().fromArray(untrack(() => direction())).normalize()
	};

	const onBeforeCompile = (shader) => {
		shader.uniforms.elapsedTime = {
			get value() {
				return settings.elapsedTime;
			}
		};

		shader.uniforms.spawnRadius = {
			get value() {
				return radius();
			}
		};

		shader.uniforms.speed = {
			get value() {
				return speed();
			}
		};

		shader.uniforms.direction = {
			get value() {
				return direction();
			}
		};

		shader.vertexShader = 'uniform float elapsedTime;' + shader.vertexShader;
		shader.fragmentShader = 'uniform float elapsedTime;' + shader.fragmentShader;
		shader.vertexShader = 'uniform float spawnRadius;' + shader.vertexShader;
		shader.fragmentShader = 'uniform float spawnRadius;' + shader.fragmentShader;
		shader.vertexShader = 'uniform vec3 direction;' + shader.vertexShader;
		shader.vertexShader = 'uniform float speed;' + shader.vertexShader;
		shader.vertexShader = 'varying float distanceToCenter;' + shader.vertexShader;
		shader.fragmentShader = 'varying float distanceToCenter;' + shader.fragmentShader;

		shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
				// move stars in one direction
				transformed.x += speed * elapsedTime * direction.x;
				transformed.y += speed * elapsedTime * direction.y;
				transformed.z += speed * elapsedTime * direction.z;

				// constrain stars inside cube
				// (ex: if a star goes to far on one side, it'll be put back to the other side)
				transformed.xyz = mod(transformed.xyz, spawnRadius * 2.0) - spawnRadius;

				#include <project_vertex>
			`);

		shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', `
				// hide points that are outside sphere shape
				distanceToCenter = distance(vec3(0.0, 0.0, 0.0), transformed);
				gl_PointSize = size * step(distanceToCenter, spawnRadius);
			`);

		shader.fragmentShader = shader.fragmentShader.replace('#include <premultiplied_alpha_fragment>', `
				#include <premultiplied_alpha_fragment>
				float	opacity = clamp(smoothstep(spawnRadius, spawnRadius * 0.9, distanceToCenter), 0.0, 1.0);
				gl_FragColor = vec4(gl_FragColor.rgb, gl_FragColor.a * opacity);
			`);
	};

	material.onBeforeCompile = onBeforeCompile;

	useTask((delta) => {
		settings.elapsedTime += delta;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Points, ($$anchor, T_Points) => {
		T_Points($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				T(node_1, {
					get is() {
						return geometry;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				T(node_2, {
					get is() {
						return material;
					},

					get size() {
						return size();
					},

					get color() {
						return color();
					},

					get opacity() {
						return opacity();
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}