import * as $ from 'svelte/internal/server';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { cn } from '$lib/utils.ts';

export default function Sidebar_menu_skeleton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			showIcon = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Random width between 50% and 90%
		const width = `${Math.floor(Math.random() * 40) + 50}%`;

		$$renderer.push(`<div${$.attributes({
			'data-sidebar': 'menu-skeleton',
			class: $.clsx(cn('flex h-8 items-center gap-2 rounded-md px-2', className)),
			...restProps
		})}>`);

		if (showIcon) {
			$$renderer.push('<!--[0-->');

			Skeleton($$renderer, {
				class: 'size-4 rounded-md',
				'data-sidebar': 'menu-skeleton-icon'
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Skeleton($$renderer, {
			class: 'h-4 max-w-(--skeleton-width) flex-1',
			'data-sidebar': 'menu-skeleton-text',
			style: `--skeleton-width: ${width};`
		});

		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}