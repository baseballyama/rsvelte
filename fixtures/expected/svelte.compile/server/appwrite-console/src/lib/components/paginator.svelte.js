import * as $ from 'svelte/internal/server';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import PaginationInline from './paginationInline.svelte';
import Limit from './limit.svelte';

export default function Paginator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			limit = 5,
			hideFooter = false,
			hidePages = true,
			hasLimit = false,
			name = 'items',
			gap = 's',
			offset = 0,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let total = $.derived(() => items.length);
		let paginatedItems = $.derived(() => items.slice(offset, offset + limit));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, $.spread_props([
					{ gap },
					restProps,
					{
						children: ($$renderer) => {
							children($$renderer, paginatedItems(), limit);
							$$renderer.push(`<!----> `);

							if (!hideFooter) {
								$$renderer.push('<!--[0-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
										wrap: 'wrap',
										children: ($$renderer) => {
											if (hasLimit) {
												$$renderer.push('<!--[0-->');

												Limit($$renderer, {
													sum: total(),
													name,
													get limit() {
														return limit;
													},

													set limit($$value) {
														limit = $$value;
														$$settled = false;
													}
												});
											} else {
												$$renderer.push('<!--[-1-->');

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-secondary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Total results: ${$.escape(total())}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`<!--]--> `);

											PaginationInline($$renderer, {
												limit,
												total: total(),
												hidePages,
												get offset() {
													return offset;
												},

												set offset($$value) {
													offset = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!---->`);
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
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { limit, offset });
	});
}