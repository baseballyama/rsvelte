import * as $ from 'svelte/internal/server';
import { Label, Switch } from "bits-ui";

export default function Switch_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-3">`);

	if (Switch.Root) {
		$$renderer.push('<!--[-->');

		Switch.Root($$renderer, {
			id: 'dnd',
			name: 'hello',
			class: 'focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			children: ($$renderer) => {
				if (Switch.Thumb) {
					$$renderer.push('<!--[-->');

					Switch.Thumb($$renderer, {
						class: 'bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 dark:bg-foreground dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Label.Root) {
		$$renderer.push('<!--[-->');

		Label.Root($$renderer, {
			for: 'dnd',
			class: 'text-sm font-medium',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Do not disturb`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}