import * as $ from 'svelte/internal/server';
import BallInstance from './BallInstance.svelte';
import { Color } from 'three';
import { DirectionalLight } from 'three';
import { Instance, InstancedMesh, interactivity } from '@threlte/extras';
import { T, useTask, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { size } = $$props;
		const gap = 2.5;
		const limit = $.derived(() => size * size);
		const offset = $.derived(() => size * gap / 2);
		const startColor = new Color('blue');
		const endColor = new Color('yellow');

		const instances = $.derived(() => {
			const results = [];

			for (let i = 0; i < limit(); i += 1) {
				const x = i % size * gap - offset();
				const z = Math.floor(i / size) * gap - offset();

				results.push(new BallInstance(startColor, endColor, x, z));
			}

			return results;
		});

		const { size: viewportSize } = useThrelte();
		const zoom = $.derived(() => $.store_get($$store_subs ??= {}, '$viewportSize', viewportSize).width / (1.5 * gap * size));

		interactivity({
			filter(items) {
				// only report the first intersection
				return items.slice(0, 1);
			}
		});

		const light = new DirectionalLight();
		const lightRadius = 10;
		const lightHeight = 5;
		let time = 0;

		useTask((delta) => {
			time += delta;

			const x = lightRadius * Math.cos(time);
			const z = lightRadius * Math.sin(time);

			light.position.set(x, lightHeight, z);
			light.lookAt(0, 0, 0);
		});

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				position: [size, size, size],
				zoom: zoom(),
				makeDefault: true,
				oncreate: (ref) => {
					ref.lookAt(0, 0, 0);
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		InstancedMesh($$renderer, {
			limit: 50 * 50,
			range: limit(),
			children: ($$renderer) => {
				if (T.SphereGeometry) {
					$$renderer.push('<!--[-->');
					T.SphereGeometry($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshToonMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshToonMaterial($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array = $.ensure_array_like(instances());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let instance = each_array[$$index];

					Instance($$renderer, {
						'rotation.x': 0.5 * Math.PI,
						'position.x': instance.x,
						'position.y': instance.y.current,
						scale: instance.scale,
						'position.z': instance.z,
						color: instance.color,
						onpointerenter: () => {
							instance.y.set(1);
						},

						onpointerleave: () => {
							instance.y.set(0);
						}
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		T($$renderer, { is: light });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}