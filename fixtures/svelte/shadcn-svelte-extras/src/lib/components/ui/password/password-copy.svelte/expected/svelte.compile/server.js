import * as $ from 'svelte/internal/server';
import { CopyButton } from '$lib/components/ui/copy-button';
import { cn } from '$lib/utils.js';
import { usePasswordCopy } from './password.svelte.js';

export default function Password_copy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className, $$slots, $$events, ...rest } = $$props;
		const state = usePasswordCopy();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CopyButton($$renderer, $.spread_props([
				rest,
				{
					text: state.root.passwordState.value,
					tabindex: -1,
					class: cn('text-muted-foreground absolute top-1/2 right-0 size-9 min-w-0 -translate-y-1/2 hover:!bg-transparent', className),
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