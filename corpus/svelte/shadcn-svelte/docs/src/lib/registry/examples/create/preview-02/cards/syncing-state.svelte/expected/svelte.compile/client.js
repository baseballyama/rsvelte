import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Syncing_state($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Root, ($$anchor, Empty_Root) => {
								Empty_Root($$anchor, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Empty.Header, ($$anchor, Empty_Header) => {
											Empty_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Empty.Media, ($$anchor, Empty_Media) => {
														Empty_Media($$anchor, {
															variant: 'icon',
															children: ($$anchor, $$slotProps) => {
																Spinner($$anchor, {});
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Empty.Title, ($$anchor, Empty_Title) => {
														Empty_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Syncing your accounts');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => Empty.Description, ($$anchor, Empty_Description) => {
														Empty_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('We\'re pulling in your latest transactions. This usually takes a few seconds.');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_3, 2);

										$.component(node_7, () => Empty.Content, ($$anchor, Empty_Content) => {
											Empty_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														variant: 'outline',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Cancel');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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