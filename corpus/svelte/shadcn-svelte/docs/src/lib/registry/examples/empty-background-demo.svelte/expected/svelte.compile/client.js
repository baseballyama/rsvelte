import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RefreshCcwIcon from "@lucide/svelte/icons/refresh-ccw";
import BellIcon from "@tabler/icons-svelte/icons/bell";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> Refresh`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Empty_background_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
		Empty_Root($$anchor, {
			class: 'h-full bg-gradient-to-b from-muted/50 from-30% to-background',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
					Empty_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
								Empty_Media($$anchor, {
									variant: 'icon',
									children: ($$anchor, $$slotProps) => {
										BellIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No Notifications');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('You\'re all caught up. New notifications will appear here.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									RefreshCcwIcon(node_6, {});
									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}