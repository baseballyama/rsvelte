import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

var root = $.from_html(`<div class="flex select-none flex-col gap-4"><div class="flex flex-col gap-2"><h3 class="text-sm font-medium">Hover preview disabled</h3> <p class="text-muted-foreground text-sm">Only shows selected rating on hover, no preview of potential selection.</p></div> <!> <p class="text-muted-foreground text-sm"> </p></div>`);

export default function Rating_group_demo_no_hover($$anchor) {
	let value = $.state(2);
	var div = root();
	var node = $.sibling($.child(div), 2);

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
						class: 'text-muted-foreground data-[state=active]:text-foreground group size-8 cursor-pointer transition-colors md:size-6',
						children: ($$anchor, $$slotProps) => {
							Star($$anchor, {
								class: 'size-full group-data-[state=active]:fill-current',
								weight: 'fill'
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => RatingGroup.Root, ($$anchor, RatingGroup_Root) => {
			RatingGroup_Root($$anchor, {
				max: 5,
				hoverPreview: false,
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

	var p = $.sibling(node, 2);
	var text = $.only_child(p);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Rating: ${$.get(value) ?? ''} out of 5 stars`));
	$.append($$anchor, div);
}