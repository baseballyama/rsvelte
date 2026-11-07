import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";

var root = $.from_svg(`418.2K Visitors <!>`, 1);
var root_1 = $.from_svg(`<!><!><!>`, 1);
var root_2 = $.from_svg(`<!><svg viewBox="0 0 100 86" preserveAspectRatio="none" class="aspect-[1/0.35] w-full text-chart-1" role="img" aria-label="Visitor trend"><path fill="currentColor" opacity="0.28"></path><path fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`, 1);

export default function Analytics_card($$anchor) {
	const areaPath = "M0 52L18 40L36 46L54 70L72 50L100 49V86H0Z";
	const strokePath = "M0 52L18 40L36 46L54 70L72 50L100 49";

	Card($$anchor, {
		class: 'mx-auto w-full max-w-sm data-[size=sm]:pb-0',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Analytics');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_3 = $.sibling($.first_child(fragment_3));

							Badge(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('+10%');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_2);

					CardAction(node_4, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('View Analytics');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var svg = $.sibling(node);
			var path = $.child(svg);

			$.set_attribute(path, 'd', areaPath);

			var path_1 = $.sibling(path);

			$.set_attribute(path_1, 'd', strokePath);
			$.reset(svg);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}