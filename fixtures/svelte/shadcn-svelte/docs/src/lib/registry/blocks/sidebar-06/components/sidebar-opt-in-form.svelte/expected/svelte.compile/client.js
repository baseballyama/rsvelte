import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form><div class="grid gap-2.5"><!> <!></div></form>`);

export default function Sidebar_opt_in_form($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'gap-2 py-4 shadow-none',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Subscribe to our newsletter');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Opt-in to receive updates and news about the sidebar.');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var div = $.child(form);
							var node_5 = $.child(div);

							$.component(node_5, () => Sidebar.Input, ($$anchor, Sidebar_Input) => {
								Sidebar_Input($$anchor, { type: 'email', placeholder: 'Email' });
							});

							var node_6 = $.sibling(node_5, 2);

							Button(node_6, {
								class: 'w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Subscribe');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.reset(form);
							$.append($$anchor, form);
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