import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import { cn } from '$lib/utils.js';
import IconGithub from '~icons/ri/github-fill';

export default function Component_unavailable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex h-full flex-col items-center justify-center gap-4 text-center', className)),
			...restProps
		})}><div class="space-y-2"><p class="text-muted-foreground text-sm">Component not available</p> <p class="text-muted-foreground text-xs">Want to contribute and make it happen?</p></div> `);

		Button($$renderer, {
			variant: 'outline',
			href: 'https://github.com/max-got/originui-svelte',
			size: 'sm',
			class: 'gap-x-2',
			children: ($$renderer) => {
				IconGithub($$renderer, { width: '16', height: '16', 'aria-hidden': 'true' });
				$$renderer.push(`<!----> Create this component`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}