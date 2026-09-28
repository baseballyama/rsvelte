import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breadcrumb, BreadcrumbItem } from "carbon-components-svelte";

export default function Breadcrumbs($$anchor) {
	const items = [
		{ href: "/", text: "Dashboard" },
		{ href: "/reports", text: "Annual reports" },
		{ href: "/reports/2019", text: "2019" }
	];

	Breadcrumb($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, $.index, ($$anchor, item, i) => {
				{
					let $0 = $.derived(() => i === items.length - 1);

					BreadcrumbItem($$anchor, {
						get href() {
							return $.get(item).href;
						},

						get isCurrentPage() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(item).text));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}