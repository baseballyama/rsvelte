import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "carbon-components-svelte";

export default function Breadcrumbs($$renderer) {
	const items = [
		{ href: "/", text: "Dashboard" },
		{ href: "/reports", text: "Annual reports" },
		{ href: "/reports/2019", text: "2019" }
	];

	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				BreadcrumbItem($$renderer, {
					href: item.href,
					isCurrentPage: i === items.length - 1,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item.text)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}