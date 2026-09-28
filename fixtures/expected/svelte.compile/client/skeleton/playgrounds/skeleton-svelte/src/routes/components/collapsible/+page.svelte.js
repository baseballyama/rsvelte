import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`Toggle <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	Collapsible($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
				Collapsible_Trigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_2 = root();
						var node_1 = $.sibling($.first_child(fragment_2));

						$.component(node_1, () => Collapsible.Indicator, ($$anchor, Collapsible_Indicator) => {
							Collapsible_Indicator($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('+');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
				Collapsible_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Content');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}