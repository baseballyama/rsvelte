import * as $ from 'svelte/internal/server';
import { Pagination } from "bits-ui";
import CaretLeft from "phosphor-svelte/lib/CaretLeft";
import CaretRight from "phosphor-svelte/lib/CaretRight";

export default function Pagination_demo($$renderer) {
	{
		function children($$renderer, { pages, range }) {
			$$renderer.push(`<div class="my-8 flex items-center">`);

			if (Pagination.PrevButton) {
				$$renderer.push('<!--[-->');

				Pagination.PrevButton($$renderer, {
					class: 'hover:bg-dark-10 disabled:text-muted-foreground mr-[25px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent active:scale-[0.98] disabled:cursor-not-allowed hover:disabled:bg-transparent',
					children: ($$renderer) => {
						CaretLeft($$renderer, { class: 'size-6' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div class="flex items-center gap-2.5"><!--[-->`);

			const each_array = $.ensure_array_like(pages);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let page = each_array[$$index];

				if (page.type === "ellipsis") {
					$$renderer.push(`<!--[0--><div class="text-foreground-alt select-none text-[15px] font-medium">...</div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (Pagination.Page) {
						$$renderer.push('<!--[-->');

						Pagination.Page($$renderer, {
							page,
							class: 'hover:bg-dark-10 data-selected:bg-foreground data-selected:text-background inline-flex size-10 select-none items-center justify-center rounded-[9px] bg-transparent text-[15px] font-medium active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 hover:disabled:bg-transparent',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page.value)}`);
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

			$$renderer.push(`<!--]--></div> `);

			if (Pagination.NextButton) {
				$$renderer.push('<!--[-->');

				Pagination.NextButton($$renderer, {
					class: 'hover:bg-dark-10 disabled:text-muted-foreground ml-[29px] inline-flex size-10 items-center justify-center rounded-[9px] bg-transparent active:scale-[0.98] disabled:cursor-not-allowed hover:disabled:bg-transparent',
					children: ($$renderer) => {
						CaretRight($$renderer, { class: 'size-6' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <p class="text-muted-foreground text-center text-[13px]">Showing ${$.escape(range.start)} - ${$.escape(range.end)}</p>`);
		}

		if (Pagination.Root) {
			$$renderer.push('<!--[-->');

			Pagination.Root($$renderer, {
				count: 100,
				perPage: 10,
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