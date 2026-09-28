import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Sheet_no_close_button($$anchor) {
	Example($$anchor, {
		title: 'No Close Button',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No Close Button');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
								Sheet_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Sheet.Content, ($$anchor, Sheet_Content) => {
							Sheet_Content($$anchor, {
								showCloseButton: false,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Sheet.Header, ($$anchor, Sheet_Header) => {
										Sheet_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Sheet.Title, ($$anchor, Sheet_Title) => {
													Sheet_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('No Close Button');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Sheet.Description, ($$anchor, Sheet_Description) => {
													Sheet_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('This sheet doesn\'t have a close button in the top-right corner. You can only close it\n					using the button below.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
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
}