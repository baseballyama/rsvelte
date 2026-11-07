import 'svelte/internal/disclose-version';
import { RadioGroup } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'items', 'value']);
var root = $.from_html(`<span> </span> `, 1);
var root_1 = $.from_html(`<!> <label> </label>`, 1);
var root_2 = $.from_html(`<main><!> <button aria-label="binding" data-testid="binding"> </button></main>`);

export default function Radio_group_test($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 7, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var node = $.child(main);

	$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
		RadioGroup_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps, {
			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, () => $$props.items, ({ value, disabled }) => value, ($$anchor, $$item, $$index, $$array) => {
					let value = () => $.get($$item).value;
					let disabled = () => $.get($$item).disabled;
					var fragment_1 = root_1();
					var node_2 = $.first_child(fragment_1);

					{
						const children = ($$anchor, $$arg0) => {
							let checked = () => ($$arg0?.()).checked;
							var fragment_2 = root();
							var span = $.first_child(fragment_2);
							var text = $.only_child(span, true);
							var text_1 = $.sibling(span);

							$.template_effect(() => {
								$.set_attribute(span, 'data-testid', `${value() ?? ''}-indicator`);
								$.set_text(text, checked());
								$.set_text(text_1, ` ${value() ?? ''}`);
							});

							$.append($$anchor, fragment_2);
						};

						$.component(node_2, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
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

					var label = $.sibling(node_2, 2);
					var text_2 = $.only_child(label);

					$.template_effect(() => {
						$.set_attribute(label, 'for', value());
						$.set_attribute(label, 'data-testid', `${value() ?? ''}-label`);
						$.set_text(text_2, `Label for ${value() ?? ''}`);
					});

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);

	$.set_attribute(button, 'tabindex', 0);

	var text_3 = $.only_child(button, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text_3, value()));
	$.delegated('click', button, () => value($$props.items[0]?.value ?? ""));
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);