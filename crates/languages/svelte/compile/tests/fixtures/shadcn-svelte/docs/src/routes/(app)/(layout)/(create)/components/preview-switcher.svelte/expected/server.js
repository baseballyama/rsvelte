import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Preview_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const PREVIEW_ITEMS = [
			{ label: "01", value: "preview-02" },
			{ label: "02", value: "preview" }
		];

		let { item } = $$props;
		const visible = $.derived(() => item === "preview" || item.startsWith("preview-0"));

		if (visible()) {
			$$renderer.push(`<!--[0--><div class="dark absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-xl bg-card/90 p-1 shadow-xl backdrop-blur-xl"><!--[-->`);

			const each_array = $.ensure_array_like(PREVIEW_ITEMS);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let previewItem = each_array[$$index];

				Button($$renderer, {
					variant: 'ghost',
					size: 'sm',
					'data-active': item === previewItem.value,
					class: 'h-7 min-w-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
					onclick: () => goto(`/create/${previewItem.value}${page.url.search}`),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(previewItem.label)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}