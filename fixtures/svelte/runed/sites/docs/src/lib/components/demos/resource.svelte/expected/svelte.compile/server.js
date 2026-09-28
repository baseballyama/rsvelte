import * as $ from 'svelte/internal/server';
import { resource } from "runed";
import { DemoContainer, Button, Input } from "@svecodocs/kit";

export default function Resource($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let id = 1;

		const searchResource = resource(
			() => id,
			async (id) => {
				const response = await fetch(`https://jsonplaceholder.typicode.com/posts?id=${id}`);

				return response.json();
			},
			{ debounce: 1000 }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center gap-2 text-nowrap">Post id: `);

					Input($$renderer, {
						type: 'number',
						placeholder: 'Type to search...',
						class: 'w-full',
						get value() {
							return id;
						},

						set value($$value) {
							id = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="bg-card text-card-foreground rounded-md border p-4"><div class="flex w-full flex-col gap-2 overflow-hidden"><div class="text-muted-foreground text-sm">Status: ${$.escape(searchResource.loading ? "Loading..." : "Ready")}</div> `);

					if (searchResource.error) {
						$$renderer.push(`<!--[0--><div class="text-destructive text-sm">Error: ${$.escape(searchResource.error.message)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="flex w-[400px] flex-col gap-1 overflow-scroll"><!--[-->`);

					const each_array = $.ensure_array_like(searchResource.current ?? []);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let result = each_array[i];

						$$renderer.push(`<pre>${$.escape(JSON.stringify(result, null, 2))}</pre>`);
					}

					$$renderer.push(`<!--]--></div></div></div> `);

					Button($$renderer, {
						onclick: () => searchResource.refetch(),
						disabled: searchResource.loading,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Refetch Results`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}