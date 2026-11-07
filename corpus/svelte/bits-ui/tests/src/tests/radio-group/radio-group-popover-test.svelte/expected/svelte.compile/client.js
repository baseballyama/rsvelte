import 'svelte/internal/disclose-version';
import { RadioGroup } from "bits-ui";
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'items', 'value']);
var root = $.from_html(`<span> </span> `, 1);
var root_1 = $.from_html(`<!> <label> </label>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<main><!> <div data-testid="value"> </div></main>`);

export default function Radio_group_popover_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_3();
	var node = $.child(main);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						'data-testid': 'content',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
								RadioGroup_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps, {
									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_4 = $.first_child(fragment_2);

										$.each(node_4, 17, () => $$props.items, ({ value, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
											let value = () => $.get($$item).value;
											let disabled = () => $.get($$item).disabled;
											var fragment_3 = root_1();
											var node_5 = $.first_child(fragment_3);

											{
												const children = ($$anchor, $$arg0) => {
													let checked = () => ($$arg0?.()).checked;
													var fragment_4 = root();
													var span = $.first_child(fragment_4);
													var text_1 = $.only_child(span, true);
													var text_2 = $.sibling(span);

													$.template_effect(() => {
														$.set_attribute(span, 'data-testid', `${value() ?? ''}-indicator`);
														$.set_text(text_1, checked());
														$.set_text(text_2, ` ${value() ?? ''}`);
													});

													$.append($$anchor, fragment_4);
												};

												$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
													RadioGroup_Item($$anchor, {
														get id() {
															return value();
														},

														get value() {
															return value();
														},

														get disabled() {
															return disabled();
														},

														get 'data-testid'() {
															return `${value() ?? ''}-item`;
														},
														children,
														$$slots: { default: true }
													});
												});
											}

											var label = $.sibling(node_5, 2);
											var text_3 = $.only_child(label);

											$.template_effect(() => {
												$.set_attribute(label, 'for', value());
												$.set_attribute(label, 'data-testid', `${value() ?? ''}-label`);
												$.set_text(text_3, `Label for ${value() ?? ''}`);
											});

											$.append($$anchor, fragment_3);
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div = $.sibling(node, 2);
	var text_4 = $.only_child(div, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text_4, value()));
	$.append($$anchor, main);
}