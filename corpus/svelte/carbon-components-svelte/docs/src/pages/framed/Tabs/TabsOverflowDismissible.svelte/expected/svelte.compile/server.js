import * as $ from 'svelte/internal/server';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsOverflowDismissible($$renderer) {
	let selectedId = "tab-1";
	let tabs = Array.from({ length: 12 }, (_, i) => ({ id: `tab-${i + 1}`, label: `Tab label ${i + 1}` }));

	function handleDismiss({ detail }) {
		tabs = tabs.filter((tab) => tab.id !== detail.id);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Tabs($$renderer, {
			dismissible: true,
			get selectedId() {
				return selectedId;
			},

			set selectedId($$value) {
				selectedId = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(tabs);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let tab = each_array[$$index];

					Tab($$renderer, { id: tab.id, label: tab.label });
				}

				$$renderer.push(`<!--]-->`);
			},

			$$slots: {
				default: true,
				content: ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(tabs);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let tab = each_array_1[$$index_1];

							TabContent($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tab.label)} content`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}