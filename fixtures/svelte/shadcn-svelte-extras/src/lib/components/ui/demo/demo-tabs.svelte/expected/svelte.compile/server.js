import * as $ from 'svelte/internal/server';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Tabs as TabsPrimitive } from 'bits-ui';

export default function Demo_tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Tabs.List) {
				$$renderer.push('<!--[-->');

				Tabs.List($$renderer, $.spread_props([
					{
						'data-slot': 'demo-tabs',
						class: cn('border-border bg-background h-9 rounded-md border', className)
					},
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'preview',
									class: 'bg-background data-[state=active]:bg-accent! rounded-sm border-none',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Preview`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');

								Tabs.Trigger($$renderer, {
									value: 'code',
									class: 'bg-background data-[state=active]:bg-accent! rounded-sm border-none',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Code`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
		$.bind_props($$props, { ref });
	});
}