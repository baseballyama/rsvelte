import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";
import StarHalf from "phosphor-svelte/lib/StarHalf";

var root = $.from_html(`<div class="flex flex-col gap-4" dir="rtl"><div class="flex flex-col gap-2"><h3 class="text-sm font-medium">تقييم بالنجوم (RTL)</h3> <p class="text-muted-foreground text-sm">Rating group with right-to-left text direction.</p></div> <!> <p class="text-muted-foreground text-sm"> </p></div>`);

export default function Rating_group_demo_rtl($$anchor) {
	let value = $.state(3);
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
						class: 'text-muted-foreground data-[state=active]:text-foreground data-[state=partial]:text-foreground size-8 cursor-pointer transition-colors md:size-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									StarHalf($$anchor, {
										class: 'size-full fill-current rtl:scale-x-[-1]',
										weight: 'fill'
									});
								};

								var consequent_1 = ($$anchor) => {
									Star($$anchor, { class: 'size-full fill-current', weight: 'fill' });
								};

								var alternate = ($$anchor) => {
									Star($$anchor, { class: 'size-full' });
								};

								$.if(node_3, ($$render) => {
									if ($.get(item).state === "partial") $$render(consequent); else if ($.get(item).state === "active") $$render(consequent_1, 1); else $$render(alternate, -1);
								});
							}

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
			RatingGroup_Root($$anchor, {
				max: 5,
				class: 'flex gap-1',
				allowHalf: true,
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

	$.template_effect(() => {
		$.set_text(text, `التقييم: ${$.get(value) ?? ''} من 5 نجوم`);
		div.dir = div.dir;
	});

	$.append($$anchor, div);
}