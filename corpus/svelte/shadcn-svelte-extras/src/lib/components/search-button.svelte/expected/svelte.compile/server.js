import * as $ from 'svelte/internal/server';
import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
import Button from '$lib/components/button.svelte';
import SearchIcon from '@lucide/svelte/icons/search';
import { cn } from '$lib/utils.js';
import { commandContext } from '$lib/context';
import { cmdOrCtrl } from '$lib/hooks/is-mac.svelte';

export default function Search_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const commandState = commandContext.get();

		Button($$renderer, {
			variant: 'outline',
			class: cn('flex w-full place-items-center justify-between px-2', className),
			onclick: commandState.setTrue,
			children: ($$renderer) => {
				$$renderer.push(`<span class="text-muted-foreground flex place-items-center gap-2">`);
				SearchIcon($$renderer, { class: 'inline size-4' });
				$$renderer.push(`<!----> Search</span> `);

				KbdGroup($$renderer, {
					children: ($$renderer) => {
						Kbd($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(cmdOrCtrl)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <span>+</span> `);

						Kbd($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->K`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}