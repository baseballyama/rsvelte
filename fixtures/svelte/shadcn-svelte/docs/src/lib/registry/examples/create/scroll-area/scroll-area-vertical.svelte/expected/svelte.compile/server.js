import * as $ from 'svelte/internal/server';
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Scroll_area_vertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

		Example($$renderer, {
			title: 'Vertical',
			children: ($$renderer) => {
				ScrollArea($$renderer, {
					class: 'mx-auto h-72 w-48 rounded-md border style-luma:rounded-2xl style-rhea:rounded-2xl',
					children: ($$renderer) => {
						$$renderer.push(`<div class="p-4"><h4 class="mb-4 text-sm leading-none font-medium">Tags</h4> <!--[-->`);

						const each_array = $.ensure_array_like(tags);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tag = each_array[$$index];

							$$renderer.push(`<div class="text-sm">${$.escape(tag)}</div> `);
							Separator($$renderer, { class: 'my-2' });
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}