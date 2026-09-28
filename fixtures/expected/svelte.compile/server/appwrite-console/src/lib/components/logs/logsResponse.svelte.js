import * as $ from 'svelte/internal/server';
import { Card } from '$lib/components';
import { Link } from '$lib/elements';

import {
	Badge,
	Divider,
	InlineCode,
	Input,
	Layout,
	Logs,
	Table,
	Tabs,
	Typography
} from '@appwrite.io/pink-svelte';

import { onMount } from 'svelte';
import LoggingAlert from './loggingAlert.svelte';

export default function LogsResponse($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedLog, product, logging } = $$props;
		let responseTab = 'logs';

		const href = product === 'site'
			? 'https://appwrite.io/docs/products/sites/logs#log-details'
			: 'https://appwrite.io/docs/products/functions/develop#logging';

		onMount(() => {
			if (selectedLog?.errors) {
				responseTab = 'errors';
			} else if (selectedLog?.logs) {
				responseTab = 'logs';
			} else if (selectedLog.requestHeaders?.length) {
				responseTab = 'headers';
			}
		});

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'none',
							children: ($$renderer) => {
								if (Tabs.Root) {
									$$renderer.push('<!--[-->');

									Tabs.Root($$renderer, {
										variant: 'secondary',
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { root }) => {
												if (Tabs.Item.Button) {
													$$renderer.push('<!--[-->');

													Tabs.Item.Button($$renderer, {
														root,
														active: responseTab === 'logs',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Logs`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Item.Button) {
													$$renderer.push('<!--[-->');

													Tabs.Item.Button($$renderer, {
														root,
														active: responseTab === 'errors',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Errors`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Tabs.Item.Button) {
													$$renderer.push('<!--[-->');

													Tabs.Item.Button($$renderer, {
														root,
														active: responseTab === 'headers',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Headers `);

															Badge($$renderer, {
																variant: 'secondary',
																size: 's',
																content: selectedLog?.responseHeaders?.length?.toString()
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

												$$renderer.push(` `);

												if (product !== 'site') {
													$$renderer.push('<!--[0-->');

													if (Tabs.Item.Button) {
														$$renderer.push('<!--[-->');

														Tabs.Item.Button($$renderer, {
															root,
															active: responseTab === 'body',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Body`);
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
										}
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								Divider($$renderer, {});
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (responseTab === 'logs') {
						$$renderer.push('<!--[0-->');

						if (selectedLog.logs) {
							$$renderer.push('<!--[0-->');
							Logs($$renderer, { logs: selectedLog.logs });
						} else if (!logging) {
							$$renderer.push('<!--[1-->');
							LoggingAlert($$renderer, { product });
						} else {
							$$renderer.push('<!--[-1-->');

							Card($$renderer, {
								padding: 'xs',
								radius: 's',
								children: ($$renderer) => {
									if (Typography.Code) {
										$$renderer.push('<!--[-->');

										Typography.Code($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No logs found.`);
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
						}

						$$renderer.push(`<!--]-->`);
					} else if (responseTab === 'errors') {
						$$renderer.push('<!--[1-->');

						if (selectedLog.errors) {
							$$renderer.push('<!--[0-->');
							Logs($$renderer, { logs: selectedLog.errors });
						} else if (!logging) {
							$$renderer.push('<!--[1-->');
							LoggingAlert($$renderer, { product });
						} else {
							$$renderer.push('<!--[-1-->');

							Card($$renderer, {
								padding: 'xs',
								radius: 's',
								children: ($$renderer) => {
									if (Typography.Code) {
										$$renderer.push('<!--[-->');

										Typography.Code($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No errors found.`);
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
						}

						$$renderer.push(`<!--]-->`);
					} else if (responseTab === 'headers') {
						$$renderer.push('<!--[2-->');

						if (selectedLog.responseHeaders?.length) {
							$$renderer.push('<!--[0-->');

							if (Table.Root) {
								$$renderer.push('<!--[-->');

								Table.Root($$renderer, {
									columns: [{ id: 'key', width: 200 }, { id: 'value' }],
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { root }) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(selectedLog.responseHeaders);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let request = each_array[$$index];

												if (Table.Row.Base) {
													$$renderer.push('<!--[-->');

													Table.Row.Base($$renderer, {
														root,
														children: ($$renderer) => {
															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	root,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(request.name)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	root,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(request.value)}`);
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

											$$renderer.push(`<!--]-->`);
										},

										header: ($$renderer, { root }) => {
											{
												if (Table.Header.Cell) {
													$$renderer.push('<!--[-->');

													Table.Header.Cell($$renderer, {
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Key`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Header.Cell) {
													$$renderer.push('<!--[-->');

													Table.Header.Cell($$renderer, {
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Value`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}
										}
									}
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Input.Helper) {
								$$renderer.push('<!--[-->');

								Input.Helper($$renderer, {
									state: 'default',
									children: ($$renderer) => {
										$$renderer.push(`<span>Missing headers? Check the `);

										Link($$renderer, {
											variant: 'muted',
											href,
											external: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->docs`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> to see
                    the supported data and how to log it.</span>`);
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

							Card($$renderer, {
								padding: 'xs',
								radius: 's',
								children: ($$renderer) => {
									if (Typography.Code) {
										$$renderer.push('<!--[-->');

										Typography.Code($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No headers found.`);
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
						}

						$$renderer.push(`<!--]-->`);
					} else if (responseTab === 'body') {
						$$renderer.push('<!--[3-->');

						if (selectedLog.responseBody) {
							$$renderer.push('<!--[0-->');
							Logs($$renderer, { logs: selectedLog.responseBody });
						} else {
							$$renderer.push('<!--[-1-->');

							Card($$renderer, {
								padding: 'xs',
								radius: 's',
								children: ($$renderer) => {
									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Body data is not captured by Appwrite for your user's security and privacy. To
                    display body data in the Logs tab, use `);

												InlineCode($$renderer, { code: 'context.log()', size: 's' });
												$$renderer.push(`<!---->. `);

												Link($$renderer, {
													external: true,
													href,
													variant: 'muted',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Learn more`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->.`);
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
						}

						$$renderer.push(`<!--]-->`);
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
	});
}