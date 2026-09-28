import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";
import StarHalf from "phosphor-svelte/lib/StarHalf";

export default function Rating_group_demo_rtl($$renderer) {
	let value = 3;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col gap-4" dir="rtl"><div class="flex flex-col gap-2"><h3 class="text-sm font-medium">تقييم بالنجوم (RTL)</h3> <p class="text-muted-foreground text-sm">Rating group with right-to-left text direction.</p></div> `);

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
							class: 'text-muted-foreground data-[state=active]:text-foreground data-[state=partial]:text-foreground size-8 cursor-pointer transition-colors md:size-6',
							children: ($$renderer) => {
								if (item.state === "partial") {
									$$renderer.push('<!--[0-->');

									StarHalf($$renderer, {
										class: 'size-full fill-current rtl:scale-x-[-1]',
										weight: 'fill'
									});
								} else if (item.state === "active") {
									$$renderer.push('<!--[1-->');
									Star($$renderer, { class: 'size-full fill-current', weight: 'fill' });
								} else {
									$$renderer.push('<!--[-1-->');
									Star($$renderer, { class: 'size-full' });
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
					class: 'flex gap-1',
					allowHalf: true,
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

		$$renderer.push(` <p class="text-muted-foreground text-sm">التقييم: ${$.escape(value)} من 5 نجوم</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}