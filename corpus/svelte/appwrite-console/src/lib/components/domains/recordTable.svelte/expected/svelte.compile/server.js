import * as $ from 'svelte/internal/server';
import { Link } from '$lib/elements';
import { Badge, Layout, Typography, Table, InteractiveText, Alert } from '@appwrite.io/pink-svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getSubdomain } from '$lib/helpers/tlds';
import { isCloud } from '$lib/system';
import { getProxyRuleStatusBadge } from './status';

export default function RecordTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			domain,
			verified,
			variant,
			service = 'general',
			ruleStatus,
			onNavigateToNameservers = () => {},
			onNavigateToA = () => {},
			onNavigateToAAAA = () => {}
		} = $$props;

		const subdomain = $.derived(() => getSubdomain(domain));

		const caaText = $.derived(() => $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CAA?.includes(' ')
			? $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CAA
			: `0 issue "${$.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CAA}"`);

		const aTabVisible = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A !== '127.0.0.1');
		const aaaaTabVisible = $.derived(() => !isCloud && Boolean($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA) && $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA !== '::1');

		function setTarget() {
			switch (variant) {
				case 'cname':
					if (service === 'sites') {
						return $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES;
					} else {
						return $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CNAME;
					}

				case 'a':
					return $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_A;

				case 'aaaa':
					return $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_AAAA;
			}
		}

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 'xl',
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 's',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 's',
										direction: 'row',
										alignItems: 'center',
										children: ($$renderer) => {
											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'l-500',
													color: '--fgcolor-neutral-primary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(domain)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (verified !== undefined) {
												$$renderer.push('<!--[0-->');

												const statusBadge = getProxyRuleStatusBadge(ruleStatus);

												if (statusBadge) {
													$$renderer.push('<!--[0-->');

													Badge($$renderer, {
														variant: 'secondary',
														type: statusBadge.type,
														size: 'xs',
														content: statusBadge.content
													});
												} else if (verified === true) {
													$$renderer.push('<!--[1-->');

													Badge($$renderer, {
														variant: 'secondary',
														type: 'success',
														size: 'xs',
														content: 'Verified'
													});
												} else {
													$$renderer.push('<!--[-1-->');
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

								$$renderer.push(` `);

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										variant: 'm-400',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add the following ${$.escape($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CAA ? 'records' : 'record')} on your DNS provider. Note that DNS changes may take up to 48 hours to propagate
            fully.`);
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

					if (Table.Root) {
						$$renderer.push('<!--[-->');

						Table.Root($$renderer, {
							class: 'responsive-table',
							columns: [
								{ id: 'type', width: { min: 150 } },
								{ id: 'name', width: { min: 80 } },
								{ id: 'value', width: { min: 100 } }
							],
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { root }) => {
									if (Table.Row.Base) {
										$$renderer.push('<!--[-->');

										Table.Row.Base($$renderer, {
											root,
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: 'type',
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(variant.toUpperCase())}`);
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
														column: 'name',
														root,
														children: ($$renderer) => {
															InteractiveText($$renderer, { variant: 'copy', isVisible: true, text: subdomain() || '@' });
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
														column: 'value',
														root,
														children: ($$renderer) => {
															InteractiveText($$renderer, { variant: 'copy', isVisible: true, text: setTarget() });
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

									if ($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_TARGET_CAA) {
										$$renderer.push('<!--[0-->');

										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'type',
															root,
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		gap: 's',
																		direction: 'row',
																		alignItems: 'center',
																		children: ($$renderer) => {
																			$$renderer.push(`<span>CAA</span> `);
																			Badge($$renderer, { variant: 'secondary', size: 'xs', content: 'Recommended' });
																			$$renderer.push(`<!---->`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'name',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->@`);
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
															column: 'value',
															root,
															children: ($$renderer) => {
																InteractiveText($$renderer, { variant: 'copy', isVisible: true, text: caaText() });
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
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},

								header: ($$renderer, { root }) => {
									{
										if (Table.Header.Cell) {
											$$renderer.push('<!--[-->');

											Table.Header.Cell($$renderer, {
												column: 'type',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Type`);
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
												column: 'name',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Name`);
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
												column: 'value',
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

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 's',
							direction: 'row',
							alignItems: 'center',
							children: ($$renderer) => {
								if (variant === 'cname' && !subdomain()) {
									$$renderer.push('<!--[0-->');

									if (isCloud) {
										$$renderer.push('<!--[0-->');

										if (Alert.Inline) {
											$$renderer.push('<!--[-->');

											Alert.Inline($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Since `);
													Badge($$renderer, { variant: 'secondary', size: 's', content: domain });

													$$renderer.push(`<!----> is an apex domain, CNAME
                    record is only supported by certain providers. If yours doesn't, please verify using `);

													Link($$renderer, {
														variant: 'muted',
														children: ($$renderer) => {
															$$renderer.push(`<!---->nameservers`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> instead.
                    If you're using Cloudflare or another CDN, make sure the proxy is disabled (set to
                    DNS only) for this record, since Appwrite serves your domain through its own CDN.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else if (aTabVisible() || aaaaTabVisible()) {
										$$renderer.push('<!--[1-->');

										if (Alert.Inline) {
											$$renderer.push('<!--[-->');

											Alert.Inline($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Since `);
													Badge($$renderer, { variant: 'secondary', size: 's', content: domain });

													$$renderer.push(`<!----> is an apex domain, CNAME
                    record is only supported by certain providers. If yours doesn't, please verify using `);

													if (aTabVisible()) {
														$$renderer.push('<!--[0-->');

														Link($$renderer, {
															variant: 'muted',
															children: ($$renderer) => {
																$$renderer.push(`<!---->A record`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														if (aaaaTabVisible()) {
															$$renderer.push(`<!--[0-->or `);

															Link($$renderer, {
																variant: 'muted',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->AAAA record`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!---->`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													} else if (aaaaTabVisible()) {
														$$renderer.push('<!--[1-->');

														Link($$renderer, {
															variant: 'muted',
															children: ($$renderer) => {
																$$renderer.push(`<!---->AAAA record`);
															},
															$$slots: { default: true }
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> instead. If you're using Cloudflare or another CDN, make sure the proxy is disabled
                    (set to DNS only) for this record, since Appwrite serves your domain through its own
                    CDN.`);
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
								} else {
									$$renderer.push('<!--[-1-->');

									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											variant: 'm-400',
											color: '--fgcolor-neutral-secondary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->A list of all domain providers and their DNS setting is available `);

												Link($$renderer, {
													variant: 'muted',
													external: true,
													href: 'https://appwrite.io/docs/advanced/platform/custom-domains',
													children: ($$renderer) => {
														$$renderer.push(`<!---->here`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}