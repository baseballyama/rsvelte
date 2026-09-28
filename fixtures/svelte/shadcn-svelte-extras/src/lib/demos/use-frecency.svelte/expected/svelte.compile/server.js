import * as $ from 'svelte/internal/server';
import { Badge } from '$lib/components/ui/badge';
import Button from '$lib/components/button.svelte';
import { UseFrecency } from '$lib/hooks/use-frecency.svelte';

export default function Use_frecency($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = ['Angular', 'Svelte', 'React', 'Vue'];
		const frecency = new UseFrecency('frecency-key');

		$$renderer.push(`<div class="flex flex-col gap-2"><div class="flex h-[120px] flex-col gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(frecency.items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(i + 1)}. ${$.escape(item)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> <div class="flex place-items-center gap-2"><!--[-->`);

		const each_array_1 = $.ensure_array_like(frameworks);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let framework = each_array_1[$$index_1];

			Button($$renderer, {
				variant: 'outline',
				onclick: () => frecency.use(framework),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(framework)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}