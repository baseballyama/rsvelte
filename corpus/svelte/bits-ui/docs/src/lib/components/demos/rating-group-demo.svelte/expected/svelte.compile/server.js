import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

export default function Rating_group_demo($$renderer) {
	let value = 3;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
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
							class: 'text-foreground hover:text-foreground data-[state=inactive]:text-muted-foreground group size-10 cursor-pointer transition-colors md:size-8',
							children: ($$renderer) => {
								Star($$renderer, { class: 'size-full', weight: 'fill' });
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}