import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { cn } from '$lib/utils.js';

export const sizeMap = {
	default: { icon: 'icon', normal: 'default' },
	xs: { icon: 'icon-xs', normal: 'xs' },
	sm: { icon: 'icon-sm', normal: 'sm' },
	lg: { icon: 'icon-lg', normal: 'lg' }
};

export default function Button_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			loading: loadingProp = false,
			onClickPromise,
			onclick,
			disabled,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let pending = false;
		const loading = $.derived(() => loadingProp || pending);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					class: cn(loading() && '[&_svg:not([data-loading-icon])]:hidden', className),
					disabled: loading() || disabled,
					onclick: async (e) => {
						onclick?.(e);

						if (onClickPromise) {
							pending = true;

							try {
								await onClickPromise(e);
							} finally {
								pending = false;
							}
						}
					}
				},
				restProps,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (loading()) {
							$$renderer.push('<!--[0-->');
							Spinner($$renderer, { 'data-icon': 'inline-start', 'data-loading-icon': true });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer);
						$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { ref });
	});
}