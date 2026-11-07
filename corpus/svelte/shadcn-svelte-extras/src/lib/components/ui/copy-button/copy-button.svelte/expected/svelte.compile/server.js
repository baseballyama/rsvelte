import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';
import { cn } from '$lib/utils.js';
import { mergeProps } from 'bits-ui';
import CheckIcon from '@lucide/svelte/icons/check';
import CopyIcon from '@lucide/svelte/icons/copy';
import XIcon from '@lucide/svelte/icons/x';
import { scale } from 'svelte/transition';

export default function Copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			text,
			icon,
			animationDuration = 500,
			variant = 'ghost',
			size = 'icon',
			onCopy,
			class: className,
			tabindex,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// this way if the user passes text then the button will be the default size
		// svelte-ignore state_referenced_locally
		if (size === 'icon' && children) {
			size = 'default';
		}

		const clipboard = new UseClipboard();

		const merged = $.derived(() => mergeProps(rest, {
			onclick: async () => {
				const status = await clipboard.copy(text);

				onCopy?.(status);
			}
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					variant,
					size,
					tabindex,
					class: cn('flex items-center gap-2', className),
					type: 'button',
					name: 'copy'
				},
				merged(),
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (clipboard.status === 'success') {
							$$renderer.push(`<!--[0--><div>`);
							CheckIcon($$renderer, { tabindex: -1 });
							$$renderer.push(`<!----> <span class="sr-only">Copied</span></div>`);
						} else if (clipboard.status === 'failure') {
							$$renderer.push(`<!--[1--><div>`);
							XIcon($$renderer, { tabindex: -1 });
							$$renderer.push(`<!----> <span class="sr-only">Failed to copy</span></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div>`);

							if (icon) {
								$$renderer.push('<!--[0-->');
								icon($$renderer);
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
								CopyIcon($$renderer, { tabindex: -1 });
							}

							$$renderer.push(`<!--]--> <span class="sr-only">Copy</span></div>`);
						}

						$$renderer.push(`<!--]--> `);
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
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