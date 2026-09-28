import * as $ from 'svelte/internal/server';
import { Card } from '$lib/components';
import { Link } from '$lib/elements';
import { Badge, Divider, Input, Layout, Table, Tabs, Typography } from '@appwrite.io/pink-svelte';

export default function LogsRequest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedLog, product } = $$props;
		let requestTab = 'parameters';

		const href = product === 'site'
			? 'https://appwrite.io/docs/products/sites/logs#log-details'
			: 'https://appwrite.io/docs/products/functions/develop#logging';

		// Make parameters reactive to selectedLog changes
		let parameters = $.derived(() => {
			try {
				// Add dummy base URL to parse relative paths
				const url = new URL(selectedLog.requestPath, 'http://dummy.local');

				if (url.search) {
					return Array.from(url.searchParams.entries()).map(([name, value]) => ({ name, value: decodeURIComponent(value) }));
				}

				return [];
			} catch(error) {
				return [];
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
														active: requestTab === 'parameters',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Parameters `);

															Badge($$renderer, {
																variant: 'secondary',
																size: 's',
																content: parameters()?.length?.toString()
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

												if (Tabs.Item.Button) {
													$$renderer.push('<!--[-->');

													Tabs.Item.Button($$renderer, {
														root,
														active: requestTab === 'headers',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Headers `);

															Badge($$renderer, {
																variant: 'secondary',
																size: 's',
																content: selectedLog?.requestHeaders?.length?.toString()
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

					if (requestTab === 'parameters') {
						$$renderer.push('<!--[0-->');

						if (parameters()?.length) {
							$$renderer.push('<!--[0-->');

							if (Table.Root) {
								$$renderer.push('<!--[-->');

								Table.Root($$renderer, {
									columns: [{ id: 'key', width: 200 }, { id: 'value' }],
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { root }) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(parameters());

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let parameter = each_array[$$index];

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
																		$$renderer.push(`<!---->${$.escape(parameter.name)}`);
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
																		$$renderer.push(`<!---->${$.escape(parameter.value)}`);
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
												$$renderer.push(`<!---->No parameters found.`);
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
					} else if (requestTab === 'headers') {
						$$renderer.push('<!--[1-->');

						if (selectedLog.requestHeaders?.length) {
							$$renderer.push('<!--[0-->');

							if (Table.Root) {
								$$renderer.push('<!--[-->');

								Table.Root($$renderer, {
									columns: [{ id: 'key', width: 200 }, { id: 'value' }],
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { root }) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(selectedLog.requestHeaders);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let request = each_array_1[$$index_1];

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