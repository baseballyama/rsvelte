import * as $ from 'svelte/internal/server';
import { Input } from '$lib/components/ui/input';
import { cn } from '$lib/utils';

export default function HeaderInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			ref = null,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Input($$renderer, $.spread_props([
				{
					type: 'text',
					class: cn('h-15 w-full rounded-none border-none !bg-transparent px-4 pr-0 !text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0', className)
				},
				rest,
				{
					onkeydown: (e) => {
						if (e.key === 'Escape' && value) {
							e.preventDefault();
							value = '';
						}

						rest.onkeydown?.(e);
					},

					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, ref });
	});
}