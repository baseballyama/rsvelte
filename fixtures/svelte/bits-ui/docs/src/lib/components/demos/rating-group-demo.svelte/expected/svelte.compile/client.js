import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

export default function Rating_group_demo($$anchor) {
	let value = $.state(3);
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
						class: 'text-foreground hover:text-foreground data-[state=inactive]:text-muted-foreground group size-10 cursor-pointer transition-colors md:size-8',
						children: ($$anchor, $$slotProps) => {
							Star($$anchor, { class: 'size-full', weight: 'fill' });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => RatingGroup.Root, ($$anchor, RatingGroup_Root) => {
			RatingGroup_Root($$anchor, {
				max: 5,
				class: 'flex gap-1',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}