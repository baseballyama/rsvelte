import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="accordion-container"><!></div>`);

export default function _Nested($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Panel(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Header(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Panel 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Content(node_3, {
						children: ($$anchor, $$slotProps) => {
							Accordion($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									Panel(node_4, {
										color: 'secondary',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_5 = $.first_child(fragment_4);

											Header(node_5, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Panel 1.1');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											var node_6 = $.sibling(node_5, 2);

											Content(node_6, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('The content for panel 1.1.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_4, 2);

									Panel(node_7, {
										color: 'secondary',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_8 = $.first_child(fragment_5);

											Header(node_8, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Panel 1.2');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_8, 2);

											Content(node_9, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('The content for panel 1.2.');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_1, 2);

			Panel(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_11 = $.first_child(fragment_6);

					Header(node_11, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Panel 2');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Content(node_12, {
						children: ($$anchor, $$slotProps) => {
							Accordion($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_13 = $.first_child(fragment_8);

									Panel(node_13, {
										color: 'secondary',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root();
											var node_14 = $.first_child(fragment_9);

											Header(node_14, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Panel 2.1');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											var node_15 = $.sibling(node_14, 2);

											Content(node_15, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('The content for panel 2.1.');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_13, 2);

									Panel(node_16, {
										color: 'secondary',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = root();
											var node_17 = $.first_child(fragment_10);

											Header(node_17, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Panel 2.2');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											var node_18 = $.sibling(node_17, 2);

											Content(node_18, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('The content for panel 2.2.');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}