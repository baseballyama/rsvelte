import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { pointerState, teleportState, teleportIntersection } from '../../internal/state.svelte.js';

export default function ShortRay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { handedness, children } = $$props;
		const hovering = $.derived(() => teleportState[handedness].hovering);
		const intersection = $.derived(() => teleportIntersection[handedness]);
		const visible = $.derived(() => pointerState[handedness].enabled || hovering() && intersection() === undefined);

		const vertexShader = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec2 uv;
    attribute vec3 position;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

		const fragmentShader = `
    precision mediump float;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, pow(vUv.y - 1.0, 2.0));
    }`;

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				visible: visible(),
				children: ($$renderer) => {
					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'rotation.x': -Math.PI / 2,
								'position.z': -0.1,
								children: ($$renderer) => {
									if (T.CylinderGeometry) {
										$$renderer.push('<!--[-->');
										T.CylinderGeometry($$renderer, { args: [0.002, 0.002, 0.2, 16, 1, false] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.RawShaderMaterial) {
										$$renderer.push('<!--[-->');
										T.RawShaderMaterial($$renderer, { transparent: true, vertexShader, fragmentShader });
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
					}

					$$renderer.push(`<!--]-->`);
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