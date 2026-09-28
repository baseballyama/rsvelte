import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, Slider } from "bits-ui";

var root = $.from_html(`<span style="position: relative; height: 8px; width: 100%; flex-grow: 1; overflow: hidden;"><!></span> <!>`, 1);
var root_1 = $.from_html(`<div style="padding: 8px 0;"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Slider_in_accordion_test($$anchor) {
	const items = ["1", "2", "3"];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'multiple',
			value: ["1"],
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 16, () => items, (item) => item, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return item;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													get 'data-testid'() {
														return `${item ?? ''}-trigger`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, `Slider ${item ?? ''}`));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										get 'data-testid'() {
											return `${item ?? ''}-content`;
										},

										children: ($$anchor, $$slotProps) => {
											var div = root_1();
											var node_6 = $.child(div);

											{
												const children = ($$anchor, $$arg0) => {
													let thumbItems = () => ($$arg0?.()).thumbItems;
													var fragment_6 = root();
													var span = $.first_child(fragment_6);
													var node_7 = $.child(span);

													$.component(node_7, () => Slider.Range, ($$anchor, Slider_Range) => {
														Slider_Range($$anchor, {
															get 'data-testid'() {
																return `range-${item ?? ''}`;
															}
														});
													});

													$.reset(span);

													var node_8 = $.sibling(span, 2);

													$.each(node_8, 17, thumbItems, ({ index }) => index, ($$anchor, $$item) => {
														let index = () => $.get($$item).index;
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Slider.Thumb, ($$anchor, Slider_Thumb) => {
															Slider_Thumb($$anchor, {
																get index() {
																	return index();
																},

																get 'data-testid'() {
																	return `thumb-${item ?? ''}`;
																},
																style: 'display: block; width: 20px; height: 20px;'
															});
														});

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
												};

												$.component(node_6, () => Slider.Root, ($$anchor, Slider_Root) => {
													Slider_Root($$anchor, {
														type: 'single',
														value: 0,
														style: 'display: flex; width: 100px;',
														children,
														$$slots: { default: true }
													});
												});
											}

											$.reset(div);
											$.append($$anchor, div);
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
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}