import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useTrailTexture, interactivity } from '@threlte/extras';
import { ShaderMaterial, Color, DoubleSide } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();

		let {
			size = 64,
			maxAge = 750,
			radius = 0.3,
			intensity = 0.2,
			interpolate = 0,
			smoothing = 0,
			minForce = 0.3,
			amount = 0.1,
			ease
		} = $$props;

		const { texture, onPointerMove } = useTrailTexture(() => ({
			size,
			radius,
			maxAge,
			intensity,
			interpolate,
			smoothing,
			minForce,
			ease
		}));

		function createMaterial(map) {
			return new ShaderMaterial({
				uniforms: {
					map: { value: map },
					color: { value: new Color('turquoise') },
					color2: { value: new Color('magenta') },
					amount: { value: amount }
				},

				vertexShader: `
        uniform sampler2D map;
        uniform float amount;
        varying float vDisplace;
        void main() {
          float displace = texture2D(map, uv).r;
          vDisplace = displace;
          vec3 pos = position;
          pos.z += displace * amount;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,

				fragmentShader: `
        uniform vec3 color;
        uniform vec3 color2;
        varying float vDisplace;
        void main() {
          vec3 col = mix(color, color2, vDisplace);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
				wireframe: true,
				side: DoubleSide
			});
		}

		const material = createMaterial(texture);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, position: [0, 0, 2.5], fov: 45 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				'rotation.x': -Math.PI * 0.3,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.z': Math.PI * 0.2,
							onpointermove: onPointerMove,
							children: ($$renderer) => {
								if (T.PlaneGeometry) {
									$$renderer.push('<!--[-->');
									T.PlaneGeometry($$renderer, { args: [2, 2, 32, 32] });
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}