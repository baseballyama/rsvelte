import * as $ from 'svelte/internal/server';
import { CopyButton } from '$lib/components/ui/copy-button';
import { cn } from '$lib/utils.js';
import { useCodeCopyButton } from './code.svelte.js';

export default function Code_copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'ghost',
			size = 'icon',
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const copyButton = useCodeCopyButton();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CopyButton($$renderer, $.spread_props([
				{
					class: cn('absolute top-2 right-2', className),
					text: copyButton.code,
					tabindex: -1,
					variant,
					size
				},
				rest,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
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