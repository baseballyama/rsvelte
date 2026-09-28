import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<div class="relative size-full"><!></div>`);

export default function Rating_group_demo_custom($$anchor, $$props) {
	let value = $.prop($$props, 'value', 3, 3.5),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let items = () => ($$arg0?.()).items;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, items, (item) => item.index, ($$anchor, item) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => RatingGroup.Item, ($$anchor, RatingGroup_Item) => {
					RatingGroup_Item($$anchor, {
						get index() {
							return $.get(item).index;
						},
						class: 'text-foreground data-[state=inactive]:text-muted-foreground data-disabled:cursor-not-allowed size-10 cursor-pointer transition-colors disabled:opacity-50 data-[readonly]:cursor-default md:size-8',
						children: ($$anchor, $$slotProps) => {
							var div = root();
							var node_3 = $.child(div);

							Star(node_3, { class: 'size-full fill-current', weight: 'fill' });
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => RatingGroup.Root, ($$anchor, RatingGroup_Root) => {
			RatingGroup_Root($$anchor, $.spread_props(() => restProps, {
				get value() {
					return value();
				},
				class: 'flex gap-1',
				children,
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
}