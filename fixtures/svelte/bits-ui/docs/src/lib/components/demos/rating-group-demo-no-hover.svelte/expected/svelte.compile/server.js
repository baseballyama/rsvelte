import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

export default function Rating_group_demo_no_hover($$renderer) {
	let value = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex select-none flex-col gap-4"><div class="flex flex-col gap-2"><h3 class="text-sm font-medium">Hover preview disabled</h3> <p class="text-muted-foreground text-sm">Only shows selected rating on hover, no preview of potential selection.</p></div> `);

		{
			function children($$renderer, { items }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (RatingGroup.Item) {
						$$renderer.push('<!--[-->');

						RatingGroup.Item($$renderer, {
							index: item.index,
							class: 'text-muted-foreground data-[state=active]:text-foreground group size-8 cursor-pointer transition-colors md:size-6',
							children: ($$renderer) => {
								Star($$renderer, {
									class: 'size-full group-data-[state=active]:fill-current',
									weight: 'fill'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			if (RatingGroup.Root) {
				$$renderer.push('<!--[-->');

				RatingGroup.Root($$renderer, {
					max: 5,
					hoverPreview: false,
					class: 'flex gap-1',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` <p class="text-muted-foreground text-sm">Rating: ${$.escape(value)} out of 5 stars</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}