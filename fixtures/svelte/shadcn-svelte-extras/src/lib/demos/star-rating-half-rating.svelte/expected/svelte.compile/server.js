import * as $ from 'svelte/internal/server';
import * as StarRating from '$lib/components/ui/star-rating';

export default function Star_rating_half_rating($$renderer) {
	let value = 3.5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex flex-col gap-2"><div>`);

		{
			function children($$renderer, { items }) {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (StarRating.Star) {
						$$renderer.push('<!--[-->');
						StarRating.Star($$renderer, $.spread_props([item]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			if (StarRating.Root) {
				$$renderer.push('<!--[-->');

				StarRating.Root($$renderer, {
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

		$$renderer.push(` <span class="text-muted-foreground text-sm">Rating is ${$.escape(value)}</span></div> <div dir="rtl"><span class="text-muted-foreground text-sm">تقييم بالنجوم (RTL)</span> `);

		{
			function children($$renderer, { items }) {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(items);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];

					if (StarRating.Star) {
						$$renderer.push('<!--[-->');
						StarRating.Star($$renderer, $.spread_props([item]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			}

			if (StarRating.Root) {
				$$renderer.push('<!--[-->');

				StarRating.Root($$renderer, {
					allowHalf: true,
					value: 3.5,
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`</div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}