import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Empty_distribute_track($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Root, ($$anchor, Empty_Root) => {
								Empty_Root($$anchor, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Empty.Media, ($$anchor, Empty_Media) => {
											Empty_Media($$anchor, {
												variant: 'icon',
												children: ($$anchor, $$slotProps) => {
													IconPlaceholder($$anchor, {
														lucide: 'PlusIcon',
														tabler: 'IconPlus',
														hugeicons: 'Add01Icon',
														phosphor: 'PlusIcon',
														remixicon: 'RiAddLine'
													});
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Empty.Header, ($$anchor, Empty_Header) => {
											Empty_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Empty.Title, ($$anchor, Empty_Title) => {
														Empty_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Distribute Track');

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

																var text_1 = $.text('Upload your first master to start reaching listeners on Spotify, Apple Music, and more.');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_4, 2);

										$.component(node_7, () => Empty.Content, ($$anchor, Empty_Content) => {
											Empty_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Create Release');

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