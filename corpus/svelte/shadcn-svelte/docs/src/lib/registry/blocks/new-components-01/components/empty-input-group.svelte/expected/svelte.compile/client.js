import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchIcon from "@lucide/svelte/icons/search";
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Need help? <a href="#/">Contact support</a>`, 1);

export default function Empty_input_group($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
		Empty_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
					Empty_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('404 - Not Found');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('The page you\'re looking for doesn\'t exist. Try searching for what you need below.');

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

				$.component(node_4, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									class: 'sm:w-3/4',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
											InputGroup_Input($$anchor, { placeholder: 'Try searching for pages...' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
											InputGroup_Addon($$anchor, {
												children: ($$anchor, $$slotProps) => {
													SearchIcon($$anchor, {});
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
											InputGroup_Addon_1($$anchor, {
												align: 'inline-end',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_9 = $.first_child(fragment_6);

													$.component(node_9, () => Kbd.Root, ($$anchor, Kbd_Root) => {
														Kbd_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('/');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_5, 2);

							$.component(node_10, () => Empty.Description, ($$anchor, Empty_Description_1) => {
								Empty_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_7 = root_2();

										$.next();
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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