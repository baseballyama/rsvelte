import * as $ from 'svelte/internal/server';
import { T, useTask, isInstanceOf } from '@threlte/core';
import { useTrailTexture, useTexture, transitions, createTransition } from '@threlte/extras';
import { cubicInOut } from 'svelte/easing';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		transitions();

		const paintings = [
			'/textures/paintings/klimt.jpg',
			'/textures/paintings/vangogh.jpg',
			'/textures/paintings/caravaggio.jpg',
			'/textures/paintings/swan.jpg'
		];

		const allLoaded = Promise.all(paintings.map((src) => useTexture(src)));

		let {
			size = 256,
			maxAge = 3500,
			radius = 0.2,
			intensity = 1,
			interpolate = 2,
			smoothing = 0.9,
			minForce = 0.3,
			ease
		} = $$props;

		const { texture: trailTexture, setTrail } = useTrailTexture(() => ({
			size,
			radius,
			maxAge,
			intensity,
			interpolate,
			smoothing,
			minForce,
			ease
		}));

		const fade = createTransition((ref) => {
			if (!isInstanceOf(ref, 'Material')) return;

			ref.transparent = true;
			ref.needsUpdate = true;

			return {
				duration: 1500,
				easing: cubicInOut,
				tick: (t) => {
					ref.opacity = t;
				}
			};
		});

		const noise = new SimplexNoise();
		let index = 0;
		let elapsed = 0;
		const swapInterval = 6;
		let time = 0;

		useTask((delta) => {
			time += delta * 0.5;

			const x = 0.5 + noise.noise(time, 0) * 0.4;
			const y = 0.5 + noise.noise(0, time) * 0.4;

			setTrail(x, y);
			elapsed += delta;

			if (elapsed >= swapInterval) {
				elapsed = 0;
				index = (index + 1) % paintings.length;
			}
		});

		let fgIndex = $.derived(() => (index + 1) % paintings.length);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { makeDefault: true, position: [0, 0, 1.8], fov: 45 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, allLoaded, () => {}, (maps) => {
			$$renderer.push(`<!---->`);

			{
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						children: ($$renderer) => {
							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, { args: [1.6, 1.6] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { map: maps[index], transparent: true, transition: fade });
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

			$$renderer.push(`<!----> <!---->`);

			{
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'position.z': 0.001,
						children: ($$renderer) => {
							if (T.PlaneGeometry) {
								$$renderer.push('<!--[-->');
								T.PlaneGeometry($$renderer, { args: [1.6, 1.6] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');

								T.MeshBasicMaterial($$renderer, {
									map: maps[fgIndex()],
									transparent: true,
									alphaMap: trailTexture,
									transition: fade
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
			}

			$$renderer.push(`<!---->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}