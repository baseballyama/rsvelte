import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";

export default function TabsNavigation($$anchor) {
	const routes = [
		{ label: "Accordion", href: "/components/Accordion" },
		{ label: "Breadcrumb", href: "/components/Breadcrumb" },
		{ label: "Button", href: "/components/Button" }
	];

	function interceptNavigation(e, href) {
		e.preventDefault();
		console.log("Navigate to:", href);
	}

	Tabs($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => routes, $.index, ($$anchor, route) => {
				Tab($$anchor, {
					get label() {
						return $.get(route).label;
					},

					get href() {
						return $.get(route).href;
					},
					$$events: { click: (e) => interceptNavigation(e, $.get(route).href) }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_1 = $.first_child(fragment_3);

				$.each(node_1, 17, () => routes, $.index, ($$anchor, route) => {
					TabContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `${$.get(route).label ?? ''} content`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			}
		}
	});
}