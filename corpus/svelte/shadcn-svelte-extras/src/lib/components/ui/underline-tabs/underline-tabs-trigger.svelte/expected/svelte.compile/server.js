import * as $ from 'svelte/internal/server';
import { Tabs as TabsPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { receive, send, useUnderlineTabsTrigger } from './underline-tabs.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Underline_tabs_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value,
			class: className,
			onmouseenter,
			onmouseleave,
			onfocus,
			onblur,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const state = useUnderlineTabsTrigger({
			value: box.with(() => value),
			onmouseenter: box.with(() => onmouseenter),
			onmouseleave: box.with(() => onmouseleave),
			onfocus: box.with(() => onfocus),
			onblur: box.with(() => onblur)
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="relative h-full">`);

			if (TabsPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				TabsPrimitive.Trigger($$renderer, $.spread_props([
					{
						'data-slot': 'underline-tabs-trigger',
						class: cn("dark:data-[state=active]:text-foreground data-[state=active]:text-foreground text-muted-foreground relative z-2 inline-flex h-[calc(100%-3px)] flex-1 items-center justify-center gap-1.5 px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", state.rootState.isHovered && state.rootState.hoveredTab === value && 'data-[state=inactive]:text-foreground!', className)
					},
					state.props,
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

			$$renderer.push(` `);

			if (state.rootState.hoveredTab === value) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn('bg-accent absolute top-0 z-1 h-[calc(100%-3px)] w-full rounded-md opacity-0 transition-opacity duration-300 peer-focus-visible:opacity-100', state.rootState.isHovered && 'opacity-100')))}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (state.rootState.opts.value.current === value) {
				$$renderer.push(`<!--[0--><div class="bg-primary absolute -bottom-px z-1 h-0.5 w-full"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
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