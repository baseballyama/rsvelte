import * as $ from 'svelte/internal/server';
import { Trim } from '$lib/components';
import { Link } from '$lib/elements';
import { Button } from '$lib/elements/forms';
import { IconExclamation, IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
import { ActionMenu, Icon, Layout, Popover, Tag, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

export default function DeploymentDomains($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { domains, hideQRCode = true, showQR = () => {} } = $$props;

		let sortedDomains = $.derived(() => domains?.rules?.sort((a, b) => {
			if (a?.trigger === 'manual' && b?.trigger !== 'manual') {
				return -1;
			} else if (a?.trigger !== 'manual' && b?.trigger === 'manual') {
				return 1;
			}

			return 0;
		}));

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 'xxs',
				direction: 'row',
				alignItems: 'center',
				children: ($$renderer) => {
					if (domains?.total) {
						$$renderer.push('<!--[0-->');

						Link($$renderer, {
							external: true,
							href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${sortedDomains()[0]?.domain}`,
							variant: 'muted',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xxs',
										direction: 'row',
										alignItems: 'center',
										children: ($$renderer) => {
											Trim($$renderer, {
												alternativeTrim: true,
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'xxs',
															direction: 'row',
															alignItems: 'flex-end',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'm-400',
																		color: '--fgcolor-neutral-primary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(sortedDomains()[0]?.domain)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (sortedDomains()[0]?.status !== 'verified') {
																	$$renderer.push('<!--[0-->');

																	Tooltip($$renderer, {
																		children: ($$renderer) => {
																			Icon($$renderer, { icon: IconExclamation, size: 's', color: '--bgcolor-warning' });
																		},

																		$$slots: {
																			default: true,
																			tooltip: ($$renderer) => {
																				$$renderer.push(`<div slot="tooltip">Not verified</div>`);
																			}
																		}
																	});
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
												},
												$$slots: { default: true }
											});
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

						$$renderer.push(`<!----> `);

						if (sortedDomains().length > 1) {
							$$renderer.push('<!--[0-->');

							Popover($$renderer, {
								padding: 'none',
								placement: 'bottom-end',
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { toggle }) => {
										Tag($$renderer, {
											size: 'xs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->+${$.escape(sortedDomains().length - 1)}`);
											},
											$$slots: { default: true }
										});
									},

									tooltip: ($$renderer) => {
										{
											if (ActionMenu.Root) {
												$$renderer.push('<!--[-->');

												ActionMenu.Root($$renderer, {
													width: '20px',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(sortedDomains());

														for (let i = 0, $$length = each_array.length; i < $$length; i++) {
															let rule = each_array[i];

															if (i !== 0) {
																$$renderer.push('<!--[0-->');

																if (ActionMenu.Item.Anchor) {
																	$$renderer.push('<!--[-->');

																	ActionMenu.Item.Anchor($$renderer, {
																		href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${rule.domain}`,
																		external: true,
																		leadingIcon: IconExternalLink,
																		children: ($$renderer) => {
																			Trim($$renderer, {
																				alternativeTrim: true,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(rule.domain)}`);
																				},
																				$$slots: { default: true }
																			});
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

														$$renderer.push(`<!--]-->`);
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (!hideQRCode) {
							$$renderer.push('<!--[0-->');

							Button($$renderer, {
								icon: true,
								secondary: true,
								size: 'xs',
								children: ($$renderer) => {
									Icon($$renderer, { icon: IconQrcode, size: 's' });
								},
								$$slots: { default: true }
							});
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
								color: '--fgcolor-neutral-primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->No domains available`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}