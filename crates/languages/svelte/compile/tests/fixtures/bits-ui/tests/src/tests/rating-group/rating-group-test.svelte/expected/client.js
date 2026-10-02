import 'svelte/internal/disclose-version';
import { RatingGroup } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'max']);
var root = $.from_html(`<span>★</span> <span> </span>`, 1);
var root_1 = $.from_html(`<main><!> <div data-testid="value-display"> </div> <button data-testid="reset-button">Reset</button> <button data-testid="set-half-button">Set 2.5</button></main>`);

export default function Rating_group_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7, 0),
		max = $.prop($$props, 'max', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var node = $.child(main);

	{
		const children = ($$anchor, $$arg0) => {
			let items = () => ($$arg0?.()).items;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, items, (item) => item.index, ($$anchor, item) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => RatingGroup.Item, ($$anchor, RatingGroup_Item) => {
					RatingGroup_Item($$anchor, {
						get index() {
							return $.get(item).index;
						},

						get 'data-testid'() {
							return `item-${$.get(item).index ?? ''}`;
						},
						class: 'rating-item h-10 w-10',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var span = $.first_child(fragment_2);
							var span_1 = $.sibling(span, 2);
							var text = $.only_child(span_1, true);

							$.template_effect(() => {
								$.set_attribute(span, 'data-testid', `star-${$.get(item).index ?? ''}`);
								$.set_attribute(span_1, 'data-testid', `state-${$.get(item).index ?? ''}`);
								$.set_text(text, $.get(item).state);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => RatingGroup.Root, ($$anchor, RatingGroup_Root) => {
			RatingGroup_Root($$anchor, $.spread_props(
				{
					'data-testid': 'root',
					get max() {
						return max();
					}
				},
				() => restProps,
				{
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	var div = $.sibling(node, 2);
	var text_1 = $.only_child(div, true);
	var button = $.sibling(div, 2);
	var button_1 = $.sibling(button, 2);

	$.reset(main);
	$.template_effect(() => $.set_text(text_1, value()));
	$.delegated('click', button, () => value(0));
	$.delegated('click', button_1, () => value(2.5));
	$.append($$anchor, main);
}

$.delegate(['click']);