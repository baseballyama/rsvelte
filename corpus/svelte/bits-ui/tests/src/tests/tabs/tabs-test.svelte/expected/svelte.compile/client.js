import 'svelte/internal/disclose-version';
import { Tabs } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'items']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main><!> <button data-testid="binding"> </button></main>`);

export default function Tabs_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7, "1"),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var node = $.child(main);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, $.spread_props({ 'aria-label': 'airplane mode', 'data-testid': 'root' }, () => restProps, {
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						'data-testid': 'list',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 17, () => $$props.items, ({ value, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
								let value = () => $.get($$item).value;
								let disabled = () => $.get($$item).disabled;
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										get value() {
											return value();
										},

										get disabled() {
											return disabled();
										},

										get 'data-testid'() {
											return `trigger-${value() ?? ''}`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, value()));
											$.append($$anchor, text);
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

				var node_4 = $.sibling(node_1, 2);

				$.each(node_4, 17, () => $$props.items, ({ value }) => value, ($$anchor, $$item, $$index_1, $$array_1) => {
					let value = () => $.get($$item).value;
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content) => {
						Tabs_Content($$anchor, {
							get value() {
								return value();
							},

							get 'data-testid'() {
								return `content-${value() ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, value()));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);
	var text_2 = $.only_child(button, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text_2, value()));
	$.delegated('click', button, () => value("1"));
	$.append($$anchor, main);
}

$.delegate(['click']);