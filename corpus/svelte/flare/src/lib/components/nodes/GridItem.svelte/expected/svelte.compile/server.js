import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import Icon from '../Icon.svelte';
import { mode } from 'mode-watcher';

export default function GridItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			props,
			selected,
			inset,
			fit,
			aspectRatio,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const paddingClass = $.derived(() => {
			switch (inset) {
				case 'small':
					return 'p-1.5';

				case 'medium':
					return 'p-2.5';

				case 'large':
					return 'p-4';

				default:
					return 'p-1';
			}
		});

		const content = $.derived(() => typeof props.content === 'object' && 'value' in props.content ? props.content.value : props.content);
		const tooltip = $.derived(() => typeof props.content === 'object' && 'tooltip' in props.content ? props.content.tooltip : undefined);

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			class: $.clsx(cn('flex w-full flex-col text-left focus:outline-none', paddingClass())),
			...restProps
		})}><div${$.attr_class(`hover:border-foreground/50 bg-muted mb-1 w-full overflow-hidden rounded-md border-2 ${selected ? 'border-foreground' : 'border-transparent'}`, void 0, { 'border-transparent': !selected })}${$.attr('title', tooltip())}${$.attr_style('', { 'aspect-ratio': aspectRatio ?? '1' })}>`);

		if (typeof content() === 'object' && 'color' in content()) {
			$$renderer.push('<!--[0-->');

			const color = typeof content().color === 'object'
				? mode.current === 'dark' ? content().color.dark : content().color.light
				: content().color;

			$$renderer.push(`<div class="h-full w-full"${$.attr_style('', { 'background-color': color })}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			Icon($$renderer, {
				icon: content(),
				class: `size-full ${fit === 'contain' ? 'object-contain' : 'object-fill'}`
			});
		}

		$$renderer.push(`<!--]--></div> `);

		if (props.title) {
			$$renderer.push(`<!--[0--><span class="truncate text-sm font-medium">${$.escape(props.title)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (props.subtitle) {
			$$renderer.push(`<!--[0--><span class="text-muted-foreground truncate text-xs">${$.escape(props.subtitle)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (props.accessory) {
			$$renderer.push(`<!--[0--><div class="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs"${$.attr('title', props.accessory.tooltip)}>`);

			if (props.accessory.icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: props.accessory.icon, class: 'size-3' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (props.accessory.text) {
				$$renderer.push(`<!--[0--><span class="truncate">${$.escape(props.accessory.text)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button>`);
	});
}