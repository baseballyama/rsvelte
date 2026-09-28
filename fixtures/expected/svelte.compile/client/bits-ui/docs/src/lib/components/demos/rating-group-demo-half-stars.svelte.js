import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";
import StarHalf from "phosphor-svelte/lib/StarHalf";

export default function Rating_group_demo_half_stars($$anchor) {
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
						class: 'text-foreground data-[state=inactive]:text-muted-foreground size-10 cursor-pointer transition-colors data-[readonly]:cursor-default md:size-8',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									Star($$anchor, { class: 'size-full' });
								};

								var consequent_1 = ($$anchor) => {
									Star($$anchor, { class: 'size-full fill-current', weight: 'fill' });
								};

								var consequent_2 = ($$anchor) => {
									StarHalf($$anchor, { class: 'size-full fill-current', weight: 'fill' });
								};

								$.if(node_3, ($$render) => {
									if ($.get(item).state === "inactive") $$render(consequent); else if ($.get(item).state === "active") $$render(consequent_1, 1); else if ($.get(item).state === "partial") $$render(consequent_2, 2);
								});
							}

							$.append($$anchor, fragment_3);
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
				allowHalf: true,
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