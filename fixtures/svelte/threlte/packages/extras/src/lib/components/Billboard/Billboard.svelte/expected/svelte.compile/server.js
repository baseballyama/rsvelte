import * as $ from 'svelte/internal/server';
import { T, useStage, useTask, useThrelte } from '@threlte/core';
import { Group, Quaternion } from 'three';

export default function Billboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			follow = true,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const inner = new Group();
		const localRef = new Group();
		const { camera, renderStage } = useThrelte();
		const q = new Quaternion();

		let followObject = $.derived(() => follow === true
			? $.store_get($$store_subs ??= {}, '$camera', camera)
			: follow === false ? undefined : follow);

		const stage = useStage('<Billboard>', { before: renderStage });

		useTask(
			() => {
				// always face the follow object
				localRef.updateMatrix();

				localRef.updateWorldMatrix(false, false);
				localRef.getWorldQuaternion(q);
				followObject()?.getWorldQuaternion(inner.quaternion).premultiply(q.invert());
			},
			{ stage, running: () => follow !== false }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: localRef },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						T($$renderer, {
							is: inner,
							children: ($$renderer) => {
								children?.($$renderer, { ref: localRef });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}