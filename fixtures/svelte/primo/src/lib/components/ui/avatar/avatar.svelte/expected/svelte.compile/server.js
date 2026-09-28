import * as $ from 'svelte/internal/server';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			loadingStatus = 'loading',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AvatarPrimitive.Root) {
				$$renderer.push('<!--[-->');

				AvatarPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)
					},
					restProps,
					{
						get loadingStatus() {
							return loadingStatus;
						},

						set loadingStatus($$value) {
							loadingStatus = $$value;
							$$settled = false;
						},

						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, loadingStatus });
	});
}