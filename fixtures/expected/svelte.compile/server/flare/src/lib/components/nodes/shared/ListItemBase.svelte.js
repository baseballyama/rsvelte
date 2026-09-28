import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/Icon.svelte';

export default function ListItemBase($$renderer, $$props) {
	let {
		title,
		subtitle,
		icon,
		isSelected,
		accessories,
		assetsPath,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	$$renderer.push(`<button${$.attributes(
		{
			type: 'button',
			class: 'hover:bg-accent/50 flex h-12 w-full items-center gap-3 rounded-md px-2 text-left',
			'data-testid': 'list-item',
			...restProps
		},
		void 0,
		{ '!bg-accent': isSelected }
	)}>`);

	if (icon) {
		$$renderer.push('<!--[0-->');
		Icon($$renderer, { icon, assetsPath, class: 'size-[22px]' });
	} else {
		$$renderer.push(`<!--[-1--><div class="size-[22px]"></div>`);
	}

	$$renderer.push(`<!--]--> <div class="flex flex-grow items-baseline gap-3 overflow-hidden"><p class="whitespace-nowrap">${$.escape(title)}</p> `);

	if (subtitle) {
		$$renderer.push(`<!--[0--><p class="text-muted-foreground truncate">${$.escape(subtitle)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> `);

	if (accessories) {
		$$renderer.push(`<!--[0--><div class="ml-auto flex shrink-0 items-center gap-4">`);
		accessories($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></button>`);
}