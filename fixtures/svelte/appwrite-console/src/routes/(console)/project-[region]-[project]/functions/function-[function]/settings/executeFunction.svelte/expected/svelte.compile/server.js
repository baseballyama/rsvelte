import * as $ from 'svelte/internal/server';
import { CardGrid, SvgIcon } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import { func } from '../store';
import { capitalize } from '$lib/helpers/string';
import { resolveRoute } from '$lib/stores/navigation';
import { page } from '$app/state';

export default function ExecuteFunction($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const executionUrl = $.derived(() => {
			return resolveRoute('/(console)/project-[region]-[project]/functions/function-[function]/executions/execute-function', page.params);
		});

		CardGrid($$renderer, {
			children: ($$renderer) => {
				if (Typography.Title) {
					$$renderer.push('<!--[-->');

					Typography.Title($$renderer, {
						size: 's',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$func', func).name)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},

			$$slots: {
				default: true,
				aside: ($$renderer) => {
					{
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xxxl',
								direction: 'row',
								wrap: 'wrap',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxxs',
											inline: true,
											children: ($$renderer) => {
												if (Typography.Caption) {
													$$renderer.push('<!--[-->');

													Typography.Caption($$renderer, {
														variant: '400',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Runtime`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-primary',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	gap: 'xxs',
																	alignItems: 'center',
																	children: ($$renderer) => {
																		SvgIcon($$renderer, {
																			size: 16,
																			iconSize: 'small',
																			name: $.store_get($$store_subs ??= {}, '$func', func).runtime.split('-')[0]
																		});

																		$$renderer.push(`<!----> ${$.escape(capitalize($.store_get($$store_subs ??= {}, '$func', func).runtime))}`);
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

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxxs',
											inline: true,
											children: ($$renderer) => {
												if (Typography.Caption) {
													$$renderer.push('<!--[-->');

													Typography.Caption($$renderer, {
														variant: '400',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Updated`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-primary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$func', func).$updatedAt))}`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxxs',
											inline: true,
											children: ($$renderer) => {
												if (Typography.Caption) {
													$$renderer.push('<!--[-->');

													Typography.Caption($$renderer, {
														variant: '400',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Created`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														color: '--fgcolor-neutral-primary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$func', func).$createdAt))}`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				},

				actions: ($$renderer) => {
					{
						Button($$renderer, {
							secondary: true,
							href: executionUrl(),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Execute`);
							},
							$$slots: { default: true }
						});
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}