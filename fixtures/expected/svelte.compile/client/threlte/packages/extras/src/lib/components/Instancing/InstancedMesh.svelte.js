import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { InstancedMesh } from 'three';
import Api from './Api.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'limit',
	'range',
	'update',
	'ref',
	'children'
]);

export default function InstancedMesh_1($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, 'default'),
		limit = $.prop($$props, 'limit', 3, 1000),
		range = $.prop($$props, 'range', 3, 1000),
		update = $.prop($$props, 'update', 3, true),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const instancedMesh = new InstancedMesh(undefined, undefined, 0);

	T($$anchor, $.spread_props(
		{
			get is() {
				return instancedMesh;
			},
			raycast: () => null,
			matrixAutoUpdate: false
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
				Api($$anchor, {
					get instancedMesh() {
						return instancedMesh;
					},

					get id() {
						return id();
					},

					get limit() {
						return limit();
					},

					get range() {
						return range();
					},

					get update() {
						return update();
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: instancedMesh }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}