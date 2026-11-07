import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { onDestroy } from 'svelte';
import { PositionMesh } from './PositionMesh.js';
import { useApi } from './api.js';
import { useInstanceId } from './useInstanceId.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'ref', 'children']);

export default function Instance($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useInstanceId),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { addInstance, removeInstance, instancedMesh, instances } = useApi(id());
	const mesh = new PositionMesh(instancedMesh, instances);

	addInstance(mesh);

	onDestroy(() => {
		removeInstance(mesh);
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return mesh;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: mesh }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}