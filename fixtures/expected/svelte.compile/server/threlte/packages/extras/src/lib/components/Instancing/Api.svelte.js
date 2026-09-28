import * as $ from 'svelte/internal/server';
import { T, useThrelte, useTask } from '@threlte/core';
import { DynamicDrawUsage, Matrix4 } from 'three';
import { createApi } from './api.js';

export default function Api($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { instancedMesh, id, limit, range, update, children } = $$props;
		const { instances } = createApi(instancedMesh, id);
		const tempMatrix = new Matrix4();
		const matrices = new Float32Array(limit * 16);

		for (let i = 0; i < limit; i++) tempMatrix.identity().toArray(matrices, i * 16);

		const colors = new Float32Array(limit * 3).fill(1);
		const parentMatrix = new Matrix4();
		const instanceMatrix = new Matrix4();
		const { invalidate } = useThrelte();
		let initialUpdateDone = false;

		function updateInstances() {
			instancedMesh.updateMatrixWorld();
			parentMatrix.copy(instancedMesh.matrixWorld).invert();

			if (instancedMesh.instanceColor) {
				instancedMesh.instanceColor.needsUpdate = true;
			}

			instancedMesh.instanceMatrix.needsUpdate = true;

			for (let i = 0, l = instances.current.length; i < l; i++) {
				const instance = instances.current[i];

				// Multiply by the inverse of the InstancedMesh world matrix so instances
				// aren't double-transformed when <InstancedMesh> isn't at identity.
				instanceMatrix.copy(instance.matrixWorld).premultiply(parentMatrix);

				instanceMatrix.toArray(matrices, i * 16);
				instance.color.toArray(colors, i * 3);
			}

			initialUpdateDone = true;
			invalidate();
		}

		useTask(
			() => {
				instancedMesh.updateMatrix();

				if (update || !initialUpdateDone) {
					updateInstances();
				}
			},
			{ autoInvalidate: false }
		);

		if (T.InstancedBufferAttribute) {
			$$renderer.push('<!--[-->');

			T.InstancedBufferAttribute($$renderer, {
				attach: 'instanceMatrix',
				count: matrices.length / 16,
				array: matrices,
				itemSize: 16,
				usage: DynamicDrawUsage
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.InstancedBufferAttribute) {
			$$renderer.push('<!--[-->');

			T.InstancedBufferAttribute($$renderer, {
				attach: 'instanceColor',
				count: colors.length / 3,
				array: colors,
				itemSize: 3,
				usage: DynamicDrawUsage
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}