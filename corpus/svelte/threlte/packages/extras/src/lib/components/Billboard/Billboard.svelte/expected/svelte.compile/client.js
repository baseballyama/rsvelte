import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useStage, useTask, useThrelte } from '@threlte/core';
import { Group, Quaternion } from 'three';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'follow',
	'ref',
	'children'
]);

export default function Billboard($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let follow = $.prop($$props, 'follow', 3, true),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const inner = new Group();
	const localRef = new Group();
	const { camera, renderStage } = useThrelte();
	const q = new Quaternion();
	let followObject = $.derived(() => follow() === true ? $camera() : follow() === false ? undefined : follow());
	const stage = useStage('<Billboard>', { before: renderStage });

	useTask(
		() => {
			// always face the follow object
			localRef.updateMatrix();

			localRef.updateWorldMatrix(false, false);
			localRef.getWorldQuaternion(q);
			$.get(followObject)?.getWorldQuaternion(inner.quaternion).premultiply(q.invert());
		},
		{ stage, running: () => follow() !== false }
	);

	T($$anchor, $.spread_props(
		{
			get is() {
				return localRef;
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
				T($$anchor, {
					get is() {
						return inner;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: localRef }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		}
	));

	$.pop();
	$$cleanup();
}