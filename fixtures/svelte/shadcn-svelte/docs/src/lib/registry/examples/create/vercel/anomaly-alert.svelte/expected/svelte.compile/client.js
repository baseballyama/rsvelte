import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Anomaly_alert($$anchor) {
	Example($$anchor, {
		title: 'Anomaly Alert',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-xs',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'p-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Empty.Root, ($$anchor, Empty_Root) => {
										Empty_Root($$anchor, {
											class: 'mx-auto p-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Empty.Header, ($$anchor, Empty_Header) => {
													Empty_Header($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_4 = $.first_child(fragment_5);

															$.component(node_4, () => Empty.Title, ($$anchor, Empty_Title) => {
																Empty_Title($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Get alerted for anomalies');

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

																		var text_1 = $.text('Automatically monitor your projects for anomalies and get notified.');

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

												var node_6 = $.sibling(node_3, 2);

												$.component(node_6, () => Empty.Content, ($$anchor, Empty_Content) => {
													Empty_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Upgrade to Observability Plus');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
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
}