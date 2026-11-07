import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Steps } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> First`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> Then`, 1);
var root_3 = $.from_html(`<!> Finally`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <div class="flex flex-col grow"><!> <!> <!> <!> <div class="flex justify-between items-center gap-2"><!> <!></div></div>`, 1);

export default function _page($$anchor) {
	Steps($$anchor, {
		defaultStep: 0,
		count: 3,
		orientation: 'vertical',
		class: 'w-ful h-48',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			$.component(node, () => Steps.List, ($$anchor, Steps_List) => {
				Steps_List($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Steps.Item, ($$anchor, Steps_Item) => {
							Steps_Item($$anchor, {
								index: 0,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Steps.Trigger, ($$anchor, Steps_Trigger) => {
										Steps_Trigger($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Steps.Indicator, ($$anchor, Steps_Indicator) => {
													Steps_Indicator($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('1');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.next();
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_2, 2);

									$.component(node_4, () => Steps.Separator, ($$anchor, Steps_Separator) => {
										Steps_Separator($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_1, 2);

						$.component(node_5, () => Steps.Item, ($$anchor, Steps_Item_1) => {
							Steps_Item_1($$anchor, {
								index: 1,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => Steps.Trigger, ($$anchor, Steps_Trigger_1) => {
										Steps_Trigger_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Steps.Indicator, ($$anchor, Steps_Indicator_1) => {
													Steps_Indicator_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('2');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.next();
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_6, 2);

									$.component(node_8, () => Steps.Separator, ($$anchor, Steps_Separator_1) => {
										Steps_Separator_1($$anchor, {});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_5, 2);

						$.component(node_9, () => Steps.Item, ($$anchor, Steps_Item_2) => {
							Steps_Item_2($$anchor, {
								index: 2,
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_10 = $.first_child(fragment_7);

									$.component(node_10, () => Steps.Trigger, ($$anchor, Steps_Trigger_2) => {
										Steps_Trigger_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_3();
												var node_11 = $.first_child(fragment_8);

												$.component(node_11, () => Steps.Indicator, ($$anchor, Steps_Indicator_2) => {
													Steps_Indicator_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('3');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.next();
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

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var div = $.sibling(node, 2);
			var node_12 = $.child(div);

			$.component(node_12, () => Steps.Content, ($$anchor, Steps_Content) => {
				Steps_Content($$anchor, {
					class: 'grow',
					index: 0,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('First do this.');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			});

			var node_13 = $.sibling(node_12, 2);

			$.component(node_13, () => Steps.Content, ($$anchor, Steps_Content_1) => {
				Steps_Content_1($$anchor, {
					class: 'grow',
					index: 1,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Then do that.');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_13, 2);

			$.component(node_14, () => Steps.Content, ($$anchor, Steps_Content_2) => {
				Steps_Content_2($$anchor, {
					class: 'grow',
					index: 2,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Almost there...');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_14, 2);

			$.component(node_15, () => Steps.Content, ($$anchor, Steps_Content_3) => {
				Steps_Content_3($$anchor, {
					class: 'grow',
					index: 3,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('All done!');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});
			});

			var div_1 = $.sibling(node_15, 2);
			var node_16 = $.child(div_1);

			$.component(node_16, () => Steps.PrevTrigger, ($$anchor, Steps_PrevTrigger) => {
				Steps_PrevTrigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Previous');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});
			});

			var node_17 = $.sibling(node_16, 2);

			$.component(node_17, () => Steps.NextTrigger, ($$anchor, Steps_NextTrigger) => {
				Steps_NextTrigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Next');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}