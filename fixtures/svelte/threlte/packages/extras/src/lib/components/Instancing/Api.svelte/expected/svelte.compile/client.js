import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte, useTask } from '@threlte/core';
import { DynamicDrawUsage, Matrix4 } from 'three';
import { createApi } from './api.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Api($$anchor, $$props) {
	$.push($$props, true);

	const $instances = () => $.store_get(instances, '$instances', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let instancedMesh = $.prop($$props, 'instancedMesh', 7);
	const { instances } = createApi(instancedMesh(), $$props.id);
	const tempMatrix = new Matrix4();
	const matrices = new Float32Array($$props.limit * 16);

	for (let i = 0; i < $$props.limit; i++) tempMatrix.identity().toArray(matrices, i * 16);

	const colors = new Float32Array($$props.limit * 3).fill(1);
	const parentMatrix = new Matrix4();
	const instanceMatrix = new Matrix4();
	const { invalidate } = useThrelte();
	let initialUpdateDone = false;

	function updateInstances() {
		instancedMesh().updateMatrixWorld();
		parentMatrix.copy(instancedMesh().matrixWorld).invert();

		if (instancedMesh().instanceColor) {
			instancedMesh().instanceColor.needsUpdate = true;
		}

		instancedMesh().instanceMatrix.needsUpdate = true;

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
			instancedMesh().updateMatrix();

			if ($$props.update || !initialUpdateDone) {
				updateInstances();
			}
		},
		{ autoInvalidate: false }
	);

	$.user_pre_effect(() => {
		const updateRange = Math.min($$props.limit, $$props.range !== undefined ? $$props.range : $$props.limit, $instances().length);

		instancedMesh().count = updateRange;
		instancedMesh().instanceMatrix.clearUpdateRanges();
		instancedMesh().instanceMatrix.addUpdateRange(0, updateRange * 16);

		if (instancedMesh().instanceColor) {
			instancedMesh().instanceColor.clearUpdateRanges();
			instancedMesh().instanceColor.addUpdateRange(0, updateRange * 3);
		}
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => matrices.length / 16);

		$.component(node, () => T.InstancedBufferAttribute, ($$anchor, T_InstancedBufferAttribute) => {
			T_InstancedBufferAttribute($$anchor, {
				attach: 'instanceMatrix',
				get count() {
					return $.get($0);
				},

				get array() {
					return matrices;
				},
				itemSize: 16,
				get usage() {
					return DynamicDrawUsage;
				}
			});
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => colors.length / 3);

		$.component(node_1, () => T.InstancedBufferAttribute, ($$anchor, T_InstancedBufferAttribute_1) => {
			T_InstancedBufferAttribute_1($$anchor, {
				attach: 'instanceColor',
				get count() {
					return $.get($0);
				},

				get array() {
					return colors;
				},
				itemSize: 3,
				get usage() {
					return DynamicDrawUsage;
				}
			});
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}