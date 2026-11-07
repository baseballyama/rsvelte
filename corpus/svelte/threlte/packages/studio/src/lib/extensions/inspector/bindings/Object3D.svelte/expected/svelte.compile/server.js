import * as $ from 'svelte/internal/server';
import { Object3D } from 'three';
import { DEG2RAD, RAD2DEG } from 'three/src/math/MathUtils.js';
import { useSnapping } from '../../snapping/useSnapping.svelte.js';
import TransactionalBinding from './TransactionalBinding.svelte';
import { haveProperty } from './utils.js';

export default function Object3D_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { objects } = $$props;
		const snapping = useSnapping();

		if (haveProperty(objects, 'visible')) {
			$$renderer.push('<!--[0-->');
			TransactionalBinding($$renderer, { objects, key: 'visible', label: 'visible' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		TransactionalBinding($$renderer, {
			objects,
			key: 'position',
			label: 'position',
			autoUpdate: true,
			options: { step: snapping.enabled ? snapping.translate : undefined }
		});

		$$renderer.push(`<!----> `);

		TransactionalBinding($$renderer, {
			objects,
			key: 'rotation',
			label: 'rotation',
			autoUpdate: true,
			transform: {
				read(value) {
					return value.set(value.x * RAD2DEG, value.y * RAD2DEG, value.z * RAD2DEG);
				},

				write(value) {
					return value.set(value.x * DEG2RAD, value.y * DEG2RAD, value.z * DEG2RAD);
				}
			},
			options: {
				format: (n) => `${n}°`,
				step: snapping.enabled ? snapping.rotate : undefined
			}
		});

		$$renderer.push(`<!----> `);
		TransactionalBinding($$renderer, { objects, key: 'scale', label: 'scale', autoUpdate: true });
		$$renderer.push(`<!----> `);

		if (haveProperty(objects, 'isMesh') || haveProperty(objects, 'isPointLight') || haveProperty(objects, 'isSpotLight') || haveProperty(objects, 'isDirectionalLight')) {
			$$renderer.push('<!--[0-->');
			TransactionalBinding($$renderer, { objects, key: 'castShadow', label: 'castShadow' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (haveProperty(objects, 'isMesh')) {
			$$renderer.push('<!--[0-->');
			TransactionalBinding($$renderer, { objects, key: 'receiveShadow', label: 'receiveShadow' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		TransactionalBinding($$renderer, { objects, key: 'frustumCulled', label: 'frustumCulled' });
		$$renderer.push(`<!----> `);
		TransactionalBinding($$renderer, { objects, key: 'matrixAutoUpdate', label: 'matrixAutoUpdate' });
		$$renderer.push(`<!----> `);

		TransactionalBinding($$renderer, {
			objects,
			key: 'matrixWorldAutoUpdate',
			label: 'matrixWorldAutoUpdate'
		});

		$$renderer.push(`<!----> `);

		TransactionalBinding($$renderer, {
			objects,
			key: 'renderOrder',
			label: 'renderOrder',
			options: { step: 1 }
		});

		$$renderer.push(`<!---->`);
	});
}