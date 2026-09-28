import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'disabled',
	'items',
	'value'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Accordion_multi_test($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false),
		items = $.prop($$props, 'items', 19, () => []),
		value = $.prop($$props, 'value', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, $.spread_props(
			{
				type: 'multiple',
				get value() {
					return value();
				},

				get disabled() {
					return disabled();
				}
			},
			() => restProps,
			{
				'data-testid': 'root',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, items, ({ value, title, disabled, content, level }) => value, ($$anchor, $$item, $$index, $$array) => {
						let value = () => $.get($$item).value;
						let title = () => $.get($$item).title;
						let disabled = () => $.get($$item).disabled;
						let content = () => $.get($$item).content;
						let level = () => $.get($$item).level;
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
							Accordion_Item($$anchor, {
								get value() {
									return value();
								},

								get disabled() {
									return disabled();
								},

								get 'data-testid'() {
									return `${value() ?? ''}-item`;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
										Accordion_Header($$anchor, {
											get level() {
												return level();
											},

											get 'data-testid'() {
												return `${value() ?? ''}-header`;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
													Accordion_Trigger($$anchor, {
														get disabled() {
															return disabled();
														},

														get 'data-testid'() {
															return `${value() ?? ''}-trigger`;
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, title()));
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
												return `${value() ?? ''}-content`;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, content()));
												$.append($$anchor, text_1);
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
			}
		));
	});

	$.append($$anchor, fragment);
}