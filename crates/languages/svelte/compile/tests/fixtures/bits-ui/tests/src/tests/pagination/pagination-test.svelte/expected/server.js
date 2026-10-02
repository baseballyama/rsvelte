import * as $ from 'svelte/internal/server';
import { Pagination } from "bits-ui";

export default function Pagination_test($$renderer, $$props) {
	let { count = 100, perPage = 10, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<main>`);

	{
		function children($$renderer, { pages, range, currentPage }) {
			$$renderer.push(`<p data-testid="current-page">${$.escape(currentPage)}</p> <p data-testid="range-start">${$.escape(range.start)}</p> <p data-testid="range-end">${$.escape(range.end)}</p> <p data-testid="range">Showing items ${$.escape(range.start)} - ${$.escape(range.end)}</p> <div>`);

			if (Pagination.PrevButton) {
				$$renderer.push('<!--[-->');

				Pagination.PrevButton($$renderer, {
					'data-testid': 'prev-button',
					children: ($$renderer) => {
						$$renderer.push(`<span>←</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <!--[-->`);

			const each_array = $.ensure_array_like(pages);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let page = each_array[$$index];

				if (page.type === "ellipsis") {
					$$renderer.push(`<!--[0--><span>...</span>`);
				} else if (page.type === "page") {
					$$renderer.push('<!--[1-->');

					if (Pagination.Page) {
						$$renderer.push('<!--[-->');

						Pagination.Page($$renderer, {
							page,
							'data-testid': `page-${$.stringify(page.value)}`,
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
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--> `);

			if (Pagination.NextButton) {
				$$renderer.push('<!--[-->');

				Pagination.NextButton($$renderer, {
					'data-testid': 'next-button',
					children: ($$renderer) => {
						$$renderer.push(`<span>→;</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		if (Pagination.Root) {
			$$renderer.push('<!--[-->');

			Pagination.Root($$renderer, $.spread_props([
				{ 'data-testid': 'root', count, perPage },
				restProps,
				{ children, $$slots: { default: true } }
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`</main>`);
}