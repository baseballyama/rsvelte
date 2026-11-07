import * as $ from 'svelte/internal/server';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsNavigation($$renderer) {
	const routes = [
		{ label: "Accordion", href: "/components/Accordion" },
		{ label: "Breadcrumb", href: "/components/Breadcrumb" },
		{ label: "Button", href: "/components/Button" }
	];

	function interceptNavigation(e, href) {
		e.preventDefault();
		console.log("Navigate to:", href);
	}

	Tabs($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(routes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let route = each_array[$$index];

				Tab($$renderer, { label: route.label, href: route.href });
			}

			$$renderer.push(`<!--]-->`);
		},

		$$slots: {
			default: true,
			content: ($$renderer) => {
				{
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(routes);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let route = each_array_1[$$index_1];

						TabContent($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(route.label)} content`);
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