import * as $ from 'svelte/internal/server';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsOverflowContainer($$renderer) {
	const items = Array.from({ length: 12 }, (_, i) => `Tab label ${i + 1}`);

	Tabs($$renderer, {
		type: 'container',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				Tab($$renderer, { label: item });
			}

			$$renderer.push(`<!--]-->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(items);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let item = each_array_1[$$index_1];

						TabContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(item)} content`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				}
			}
		}
	});
}