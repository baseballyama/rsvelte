import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'hiddenUntilFound',
	'items'
]);

var root = $.from_html(`<div> <p>Nested paragraph with more searchable text.</p></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><p data-testid="binding"> </p> <!> <button data-testid="alt-trigger">Toggle</button></main>`);

export default function Accordion_multi_hidden_until_found_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 23, () => []),
		hiddenUntilFound = $.prop($$props, 'hiddenUntilFound', 3, true),
		items = $.prop($$props, 'items', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var p = $.child(main);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, $.spread_props({ 'data-testid': 'root', type: 'multiple' }, () => restProps, {
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, items, ({ value: itemValue, title, disabled, content, level }) => itemValue, ($$anchor, $$item) => {
					let itemValue = () => $.get($$item).value;
					let title = () => $.get($$item).title;
					let disabled = () => $.get($$item).disabled;
					let content = () => $.get($$item).content;
					let level = () => $.get($$item).level;
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return itemValue();
							},

							get disabled() {
								return disabled();
							},

							get 'data-testid'() {
								return `${itemValue() ?? ''}-item`;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Accordion.Header, ($$anchor, Accordion_Header) => {
									Accordion_Header($$anchor, {
										get level() {
											return level();
										},

										get 'data-testid'() {
											return `${itemValue() ?? ''}-header`;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
												Accordion_Trigger($$anchor, {
													get disabled() {
														return disabled();
													},

													get 'data-testid'() {
														return `${itemValue() ?? ''}-trigger`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, title()));
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

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										get 'data-testid'() {
											return `${itemValue() ?? ''}-content`;
										},

										get hiddenUntilFound() {
											return hiddenUntilFound();
										},

										children: ($$anchor, $$slotProps) => {
											var div = root();
											var text_2 = $.child(div);
											var p_1 = $.sibling(text_2);

											$.reset(div);

											$.template_effect(() => {
												$.set_attribute(div, 'data-testid', `${itemValue() ?? ''}-searchable-content`);

												$.set_text(text_2, `${content() ?? ''} This is some searchable content that should be found by the browser's
						search functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. `);

												$.set_attribute(p_1, 'data-testid', `${itemValue() ?? ''}-nested-content`);
											});

											$.append($$anchor, div);
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
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);

	$.reset(main);
	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(value())]);
	$.delegated('click', button, () => value(value().length > 0 ? [] : [items()[0]?.value ?? ""]));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);