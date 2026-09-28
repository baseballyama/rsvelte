import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { useCodeOverflow } from './code.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils.js';

export default function Code_overflow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			collapsed = true,
			class: className,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const state = useCodeOverflow({ collapsed: box.with(() => collapsed, (v) => collapsed = v) });

		$$renderer.push(`<div${$.attributes({
			...props,
			'data-code-overflow': true,
			'data-collapsed': collapsed,
			class: $.clsx(cn('relative overflow-y-hidden data-[collapsed=true]:max-h-[300px]', className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (collapsed) {
			$$renderer.push(`<!--[0--><div class="from-background absolute bottom-0 left-0 z-10 h-full w-full bg-linear-to-t to-transparent"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (collapsed) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'secondary',
				size: 'sm',
				class: 'absolute bottom-2 left-1/2 z-20 w-fit -translate-x-1/2',
				onclick: state.toggleCollapsed,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Expand`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { collapsed });
	});
}