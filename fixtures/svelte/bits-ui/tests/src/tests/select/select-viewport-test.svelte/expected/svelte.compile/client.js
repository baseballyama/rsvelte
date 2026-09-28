import 'svelte/internal/disclose-version';
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";
import * as $ from 'svelte/internal/client';
import "../../app.css";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'items', 'value', 'open']);
var root = $.from_html(`<!> <!>`, 1);

export default function Select_viewport_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, $.spread_props(() => restProps, {
			type: 'single',
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open Listbox');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									'data-testid': 'content',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Select.Viewport, ($$anchor, Select_Viewport) => {
											Select_Viewport($$anchor, {
												'data-testid': 'viewport',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													$.each(node_5, 17, () => $$props.items, ({ value, label, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
														let value = () => $.get($$item).value;
														let label = () => $.get($$item).label;
														let disabled = () => $.get($$item).disabled;
														const testId = $.derived(() => generateTestId(value()));
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																get disabled() {
																	return disabled();
																},

																get value() {
																	return value();
																},

																get label() {
																	return label();
																},

																get 'data-testid'() {
																	return $.get(testId);
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text();

																	$.template_effect(() => $.set_text(text_1, label()));
																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
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
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}