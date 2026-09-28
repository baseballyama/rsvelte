import * as $ from 'svelte/internal/server';
import { Splat, SplatLoader } from '@pmndrs/vanilla';
import { T, useLoader, useTask, useThrelte } from '@threlte/core';

export default function Splat_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			src,
			alphaHash = false,
			alphaTest = undefined,
			toneMapped = undefined,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { renderer, camera } = useThrelte();
		const loader = useLoader(SplatLoader, { args: [renderer] });
		let framesRendered = 0;
		let running = false;

		useTask(
			() => {
				framesRendered++;

				// render for 10 frames
				if (framesRendered >= 10) {
					running = false;
				}
			},
			{ running: () => running }
		);

		$.await($$renderer, loader.load(src), () => {}, (splat) => {
			T($$renderer, $.spread_props([
				rest,
				{
					dispose: false,
					is: Splat,
					args: [
						splat,
						$.store_get($$store_subs ??= {}, '$camera', camera),
						{ alphaHash, alphaTest, toneMapped }
					],

					oncreate: () => {
						running = true;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: Splat });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		});

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}