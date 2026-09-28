import * as $ from 'svelte/internal/server';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { useDemo } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = 'preview',
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		useDemo({ value: box.with(() => value, (v) => value = v) });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, $.spread_props([
					{ 'data-slot': 'demo', class: cn(className) },
					rest,
					{
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
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
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
		$.bind_props($$props, { value, ref });
	});
}