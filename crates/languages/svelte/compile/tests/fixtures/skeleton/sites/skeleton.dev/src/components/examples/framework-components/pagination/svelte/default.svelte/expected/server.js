import * as $ from 'svelte/internal/server';
import { users } from './data';
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
import { Pagination } from '@skeletonlabs/skeleton-svelte';

const PAGE_SIZE = 5;

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let page = 1;
		const start = $.derived(() => (page - 1) * PAGE_SIZE);
		const end = $.derived(() => start() + PAGE_SIZE);
		const paginatedUsers = $.derived(() => users.slice(start(), end()));

		$$renderer.push(`<div class="grid gap-4 w-full place-items-center"><table class="table table-auto"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Country</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(paginatedUsers());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let user = each_array[$$index];

			$$renderer.push(`<tr><td>${$.escape(user.id)}</td><td>${$.escape(user.name)}</td><td>${$.escape(user.email)}</td><td>${$.escape(user.country)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table> `);

		Pagination($$renderer, {
			count: users.length,
			pageSize: PAGE_SIZE,
			page,
			onPageChange: (event) => page = event.page,
			children: ($$renderer) => {
				if (Pagination.PrevTrigger) {
					$$renderer.push('<!--[-->');

					Pagination.PrevTrigger($$renderer, {
						children: ($$renderer) => {
							ArrowLeftIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				{
					function children($$renderer, pagination) {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(pagination().pages);

						for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
							let page = each_array_1[index];

							if (page.type === 'page') {
								$$renderer.push('<!--[0-->');

								if (Pagination.Item) {
									$$renderer.push('<!--[-->');

									Pagination.Item($$renderer, $.spread_props([
										page,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page.value)}`);
											},
											$$slots: { default: true }
										}
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');

								if (Pagination.Ellipsis) {
									$$renderer.push('<!--[-->');

									Pagination.Ellipsis($$renderer, {
										index,
										children: ($$renderer) => {
											$$renderer.push(`<!---->…`);
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

						$$renderer.push(`<!--]-->`);
					}

					if (Pagination.Context) {
						$$renderer.push('<!--[-->');
						Pagination.Context($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(` `);

				if (Pagination.NextTrigger) {
					$$renderer.push('<!--[-->');

					Pagination.NextTrigger($$renderer, {
						children: ($$renderer) => {
							ArrowRightIcon($$renderer, { class: 'size-4' });
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}