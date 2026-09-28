import 'svelte/internal/disclose-version';
import { ToggleGroup } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'items']);
var root = $.from_html(`<main><button data-testid="binding" aria-label="binding"> </button> <!></main>`);

export default function Toggle_group_multi_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 23, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();
	var button = $.child(main);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps, {
			type: 'multiple',
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
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
						ToggleGroup_Item($$anchor, {
							get value() {
								return value();
							},

							get disabled() {
								return disabled();
							},

							get 'data-testid'() {
								return `item-${value() ?? ''}`;
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

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);
	$.template_effect(() => $.set_text(text, value()));
	$.delegated('click', button, () => value(["4"]));
	$.append($$anchor, main);
}

$.delegate(['click']);