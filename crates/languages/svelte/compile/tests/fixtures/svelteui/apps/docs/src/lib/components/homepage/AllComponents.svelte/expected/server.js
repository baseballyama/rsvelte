import * as $ from 'svelte/internal/server';

import {
	Group,
	ThemeIcon,
	Text,
	SimpleGrid,
	Box,
	Stack,
	ActionIcon,
	Tooltip,
	Container
} from '@svelteuidev/core';

import { ArrowRight } from 'radix-icons-svelte';
import { components } from '$lib/data';

export default function AllComponents($$renderer, $$props) {
	// @ts-nocheck
	// prettier-ignore
	// import type { CSS } from '@svelteuidev/core'
	const styles = {
		focusRing: 'auto',
		display: 'block',
		padding: '$xlPX',
		borderRadius: '$md',
		border: `1px solid $gray300`,
		backgroundColor: 'white',
		color: 'black',
		'&:hover': { textDecoration: 'none' }
	};

	SimpleGrid($$renderer, {
		breakpoints: [
			{ minWidth: 800, cols: 1, spacing: 'md' },
			{ minWidth: 1024, cols: 3, spacing: 'sm' }
		],
		spacing: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(components);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				Box($$renderer, {
					href: item.link,
					css: styles,
					children: ($$renderer) => {
						Stack($$renderer, {
							children: ($$renderer) => {
								Group($$renderer, {
									children: 2,
									position: 'apart',
									$$slots: {
										default: ($$renderer) => {
											Group($$renderer, {
												children: 2,
												$$slots: {
													default: ($$renderer) => {
														ThemeIcon($$renderer, {
															size: 34,
															override: { backgroundColor: item.color },
															children: ($$renderer) => {
																if (item.icon) {
																	$$renderer.push('<!--[-->');
																	item.icon($$renderer, { size: 20 });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Text($$renderer, {
															weight: 'extrabold',
															override: { letterSpacing: '$tight' },
															size: 'xl',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(item.title)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													}
												}
											});

											$$renderer.push(`<!----> `);

											Tooltip($$renderer, {
												label: `Go to ${item.title} docs`,
												children: ($$renderer) => {
													$$renderer.push(`<a${$.attr('href', item.link)}>`);

													ActionIcon($$renderer, {
														variant: 'light',
														size: 'lg',
														children: ($$renderer) => {
															ArrowRight($$renderer, { color: 'black' });
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></a>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										}
									}
								});

								$$renderer.push(`<!----> `);

								Container($$renderer, {
									children: ($$renderer) => {
										if (item?.content) {
											$$renderer.push('<!--[0-->');

											if (item.component) {
												$$renderer.push('<!--[-->');

												item.component($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														$.slot($$renderer, $$props, 'default', {}, () => {
															$$renderer.push(`${$.escape(item.content.valueOf())}`);
														});

														$$renderer.push(`<!--]-->`);
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

											if (item.component) {
												$$renderer.push('<!--[-->');
												item.component($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}