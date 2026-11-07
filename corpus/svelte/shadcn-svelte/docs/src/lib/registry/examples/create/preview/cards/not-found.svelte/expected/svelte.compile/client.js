import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Not_found($$anchor) {
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
									class: 'h-72',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Empty.Header, ($$anchor, Empty_Header) => {
											Empty_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Empty.Title, ($$anchor, Empty_Title) => {
														Empty_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('404 - Not Found');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Empty.Description, ($$anchor, Empty_Description) => {
														Empty_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('The page you\'re looking for doesn\'t exist. Try searching for what you need below.');

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

										var node_6 = $.sibling(node_3, 2);

										$.component(node_6, () => Empty.Content, ($$anchor, Empty_Content) => {
											Empty_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															class: 'w-3/4',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_8 = $.first_child(fragment_6);

																$.component(node_8, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { placeholder: 'Try searching for pages...' });
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'SearchIcon',
																				tabler: 'IconSearch',
																				hugeicons: 'Search01Icon',
																				phosphor: 'MagnifyingGlassIcon',
																				remixicon: 'RiSearchLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																	InputGroup_Addon_1($$anchor, {
																		align: 'inline-end',
																		children: ($$anchor, $$slotProps) => {
																			Kbd($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('/');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_7, 2);

													Button(node_11, {
														variant: 'link',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Go to homepage');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_5);
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