import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";
import StarHalf from "phosphor-svelte/lib/StarHalf";

export default function Rating_group_demo_half_stars($$renderer) {
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
							class: 'text-foreground data-[state=inactive]:text-muted-foreground size-10 cursor-pointer transition-colors data-[readonly]:cursor-default md:size-8',
							children: ($$renderer) => {
								if (item.state === "inactive") {
									$$renderer.push('<!--[0-->');
									Star($$renderer, { class: 'size-full' });
								} else if (item.state === "active") {
									$$renderer.push('<!--[1-->');
									Star($$renderer, { class: 'size-full fill-current', weight: 'fill' });
								} else if (item.state === "partial") {
									$$renderer.push('<!--[2-->');
									StarHalf($$renderer, { class: 'size-full fill-current', weight: 'fill' });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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
					allowHalf: true,
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