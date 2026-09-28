import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";

var root = $.from_html(`content-1 <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`content-2 <!> <!>`, 1);
var root_3 = $.from_html(`content-3 <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Popover_siblings_test($$anchor) {
	var fragment = root_4();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-testid': 'open-1',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open-1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									'data-testid': 'content-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var node_4 = $.sibling($.first_child(fragment_3));

										$.component(node_4, () => Popover.Close, ($$anchor, Popover_Close) => {
											Popover_Close($$anchor, {
												'data-testid': 'close-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('close-1');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Popover.Arrow, ($$anchor, Popover_Arrow) => {
											Popover_Arrow($$anchor, {});
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

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => Popover.Root, ($$anchor, Popover_Root_1) => {
		Popover_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
					Popover_Trigger_1($$anchor, {
						'data-testid': 'open-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('open-2');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Popover.Portal, ($$anchor, Popover_Portal_1) => {
					Popover_Portal_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Popover.Content, ($$anchor, Popover_Content_1) => {
								Popover_Content_1($$anchor, {
									'data-testid': 'content-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_6 = root_2();
										var node_10 = $.sibling($.first_child(fragment_6));

										$.component(node_10, () => Popover.Close, ($$anchor, Popover_Close_1) => {
											Popover_Close_1($$anchor, {
												'data-testid': 'close-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('close-2');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Popover.Arrow, ($$anchor, Popover_Arrow_1) => {
											Popover_Arrow_1($$anchor, {});
										});

										$.append($$anchor, fragment_6);
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

	var node_12 = $.sibling(node_6, 2);

	$.component(node_12, () => Popover.Root, ($$anchor, Popover_Root_2) => {
		Popover_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_13 = $.first_child(fragment_7);

				$.component(node_13, () => Popover.Trigger, ($$anchor, Popover_Trigger_2) => {
					Popover_Trigger_2($$anchor, {
						'data-testid': 'open-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('open-3');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => Popover.Portal, ($$anchor, Popover_Portal_2) => {
					Popover_Portal_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_15 = $.first_child(fragment_8);

							$.component(node_15, () => Popover.Content, ($$anchor, Popover_Content_2) => {
								Popover_Content_2($$anchor, {
									'data-testid': 'content-3',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_9 = root_3();
										var node_16 = $.sibling($.first_child(fragment_9));

										$.component(node_16, () => Popover.Close, ($$anchor, Popover_Close_2) => {
											Popover_Close_2($$anchor, {
												'data-testid': 'close-3',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('close-3');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Popover.Arrow, ($$anchor, Popover_Arrow_2) => {
											Popover_Arrow_2($$anchor, {});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}