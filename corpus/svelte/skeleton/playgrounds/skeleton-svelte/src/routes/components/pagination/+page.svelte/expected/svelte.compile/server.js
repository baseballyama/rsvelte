import * as $ from 'svelte/internal/server';
import { Pagination } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Pagination($$renderer, {
			count: 5000,
			pageSize: 10,
			children: ($$renderer) => {
				if (Pagination.FirstTrigger) {
					$$renderer.push('<!--[-->');

					Pagination.FirstTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->First`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Pagination.PrevTrigger) {
					$$renderer.push('<!--[-->');

					Pagination.PrevTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Prev`);
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

						const each_array = $.ensure_array_like(pagination().pages);

						for (let index = 0, $$length = each_array.length; index < $$length; index++) {
							let page = each_array[index];

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
							$$renderer.push(`<!---->Next`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Pagination.LastTrigger) {
					$$renderer.push('<!--[-->');

					Pagination.LastTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Last`);
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
	});
}