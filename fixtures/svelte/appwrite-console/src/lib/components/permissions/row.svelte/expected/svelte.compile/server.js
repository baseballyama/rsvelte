import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { sdk } from '$lib/stores/sdk';
import { AvatarInitials } from '../';
import { isSmallViewport } from '$lib/stores/viewport';

import {
	Badge,
	Divider,
	Icon,
	InteractiveText,
	Layout,
	Link,
	Popover,
	Spinner,
	Typography
} from '@appwrite.io/pink-svelte';

import Avatar from '../avatar.svelte';
import { IconAnonymous, IconMinusSm } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { menuOpen } from '$lib/components/menu/store';
import { base } from '$app/paths';
import { formatName } from '$lib/helpers/string';

export default function Row($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const permissionDataCache = new Map();
		let { role, placement = 'bottom-start', children, onNotFound } = $$props;

		function parsePermission(permission) {
			try {
				const [type, rest] = permission.split(':');

				if (!rest) {
					return { type: 'other', id: permission, isValid: false };
				}

				const [id, roleName] = rest.split('/');

				if (!id) {
					return { type: 'other', id: permission, isValid: false };
				}

				if (type === 'user' || type === 'team') {
					return { type, id, roleName, isValid: true };
				}

				return { type: 'other', id: permission, isValid: false };
			} catch(error) {
				return { type: 'other', id: permission, isValid: false };
			}
		}

		async function fetchPermissionData(parsed) {
			if (!parsed.isValid || parsed.type === 'other') {
				return {
					notFound: true,
					roleName: parsed.roleName,
					customName: parsed.id
				};
			}

			if (parsed.type === 'user') {
				try {
					return await sdk.forProject(page.params.region, page.params.project).users.get({ userId: parsed.id });
				} catch(error) {
					return {
						notFound: true,
						roleName: parsed.roleName,
						customName: parsed.id
					};
				}
			}

			if (parsed.type === 'team') {
				try {
					return await sdk.forProject(page.params.region, page.params.project).teams.get({ teamId: parsed.id });
				} catch(error) {
					return {
						notFound: true,
						roleName: parsed.roleName,
						customName: parsed.id
					};
				}
			}

			return {
				notFound: true,
				roleName: parsed.roleName,
				customName: parsed.id
			};
		}

		async function getData(permission) {
			const cached = permissionDataCache.get(permission);

			if (cached) return cached;

			const parsed = parsePermission(permission);
			const fetchPromise = fetchPermissionData(parsed);

			permissionDataCache.set(permission, fetchPromise);

			return fetchPromise;
		}

		async function verifyExistence() {
			try {
				const data = await getData(role);

				if (data?.notFound) {
					onNotFound?.(role);
				}
			} catch {
				// Intentionally ignore fetch/parse errors; UI handles missing data state
			}
		}

		onMount(() => {
			verifyExistence();
		});

		let isMouseOverTooltip = false;

		function hidePopover(hideTooltip, timeout = true) {
			if (!timeout) {
				isMouseOverTooltip = false;

				return hideTooltip();
			}

			setTimeout(
				() => {
					if (!isMouseOverTooltip) {
						hideTooltip();
					}
				},
				150
			);
		}

		function isCustomPermission(role) {
			const parsed = parsePermission(role);

			return !!parsed.roleName || !parsed.isValid;
		}

		if (role === 'users') {
			$$renderer.push(`<!--[0--><div>Users</div>`);
		} else if (role === 'guests') {
			$$renderer.push(`<!--[1--><div>Guests</div>`);
		} else if (role === 'any') {
			$$renderer.push(`<!--[2--><div>Any</div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			Popover($$renderer, {
				placement,
				portal: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { show, hide }) => {
						$$renderer.push(`<button type="button">`);
						children?.($$renderer);
						$$renderer.push(`<!----> `);

						if (isCustomPermission(role)) {
							$$renderer.push('<!--[0-->');

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									style: 'text-decoration: underline;',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(formatName(role, $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 8 : 15))}`);
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

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									alignItems: 'center',
									inline: true,
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												children: ($$renderer) => {
													$.await(
														$$renderer,
														getData(role),
														() => {
															$$renderer.push(`${$.escape(role)}`);
														},
														(data) => {
															$$renderer.push(`${$.escape(formatName(data.name ?? data?.email ?? data?.phone ?? '-', $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 16 : 20))}`);
														}
													);

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

										Badge($$renderer, {
											size: 'xs',
											variant: 'secondary',
											content: role.startsWith('user') ? 'User' : 'Team'
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

						$$renderer.push(`<!--]--></button>`);
					},

					tooltip: ($$renderer, { hide, showing }) => {
						$$renderer.push(`<div slot="tooltip" role="tooltip" class="popover svelte-1femmhr">`);

						if (showing) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 's',
									alignContent: 'flex-start',
									children: ($$renderer) => {
										$.await(
											$$renderer,
											getData(role),
											() => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														alignItems: 'center',
														children: ($$renderer) => {
															Spinner($$renderer, {});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											(data) => {
												if (data.notFound) {
													$$renderer.push('<!--[0-->');

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															alignItems: 'flex-start',
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		gap: 's',
																		alignItems: 'center',
																		justifyContent: 'flex-start',
																		children: ($$renderer) => {
																			Avatar($$renderer, {
																				alt: 'avatar',
																				size: 'm',
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconMinusSm, size: 's' });
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					alignItems: 'flex-start',
																					gap: 'xxs',
																					children: ($$renderer) => {
																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								style: 'padding-left: 0.25rem;',
																								children: ($$renderer) => {
																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											size: 'm',
																											color: '--fgcolor-neutral-primary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(formatName(data.customName ?? '', $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 20 : 28))}`);
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

																						if (data.roleName) {
																							$$renderer.push('<!--[0-->');

																							InteractiveText($$renderer, {
																								isVisible: true,
																								variant: 'copy',
																								text: formatName(data.roleName, $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 20 : 28),
																								value: data.roleName
																							});
																						} else {
																							$$renderer.push('<!--[-1-->');

																							InteractiveText($$renderer, {
																								isVisible: true,
																								variant: 'copy',
																								text: formatName(role, $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 20 : 28),
																								value: role
																							});
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

													const isUser = role.startsWith('user');
													const isAnonymous = !data.email && !data.phone && !data.name && isUser;
													const parsed = parsePermission(role);
													const id = parsed.id;

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															alignItems: 'flex-start',
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		gap: 's',
																		alignItems: 'center',
																		justifyContent: 'flex-start',
																		children: ($$renderer) => {
																			if (isAnonymous) {
																				$$renderer.push('<!--[0-->');

																				Avatar($$renderer, {
																					alt: 'avatar',
																					size: 'm',
																					children: ($$renderer) => {
																						Icon($$renderer, { icon: IconAnonymous, size: 's' });
																					},
																					$$slots: { default: true }
																				});
																			} else if (data.name) {
																				$$renderer.push('<!--[1-->');
																				AvatarInitials($$renderer, { name: data.name, size: 'm' });
																			} else {
																				$$renderer.push('<!--[-1-->');

																				Avatar($$renderer, {
																					alt: 'avatar',
																					size: 'm',
																					children: ($$renderer) => {
																						Icon($$renderer, { icon: IconMinusSm, size: 's' });
																					},
																					$$slots: { default: true }
																				});
																			}

																			$$renderer.push(`<!--]--> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					alignItems: 'flex-start',
																					gap: 'xxs',
																					children: ($$renderer) => {
																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								style: 'padding-left: 0.25rem;',
																								children: ($$renderer) => {
																									if (Link.Anchor) {
																										$$renderer.push('<!--[-->');

																										Link.Anchor($$renderer, {
																											variant: 'quiet',
																											href: role.startsWith('user')
																												? `${base}/project-${page.params.region}-${page.params.project}/auth/user-${id}`
																												: `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${id}`,

																											children: ($$renderer) => {
																												if (Typography.Text) {
																													$$renderer.push('<!--[-->');

																													Typography.Text($$renderer, {
																														size: 'm',
																														color: '--fgcolor-neutral-primary',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->${$.escape(formatName(data.name ?? data?.email ?? data?.phone ?? '-', $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 18 : 24))}`);
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
																						InteractiveText($$renderer, { isVisible: true, variant: 'copy', text: id, value: id });
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

																if (isUser && (data.email || data.phone)) {
																	$$renderer.push('<!--[0-->');
																	Divider($$renderer, {});
																	$$renderer.push(`<!----> `);

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 'xxs',
																			alignItems: 'flex-start',
																			children: ($$renderer) => {
																				if (data.email) {
																					$$renderer.push('<!--[0-->');

																					if (Typography.Caption) {
																						$$renderer.push('<!--[-->');

																						Typography.Caption($$renderer, {
																							variant: '400',
																							color: '--fgcolor-neutral-secondary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Email: ${$.escape(formatName(data.email, $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 24 : 32))}`);
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

																				$$renderer.push(`<!--]--> `);

																				if (data.phone) {
																					$$renderer.push('<!--[0-->');

																					if (Typography.Caption) {
																						$$renderer.push('<!--[-->');

																						Typography.Caption($$renderer, {
																							variant: '400',
																							color: '--fgcolor-neutral-secondary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Phone: ${$.escape(data.phone)}`);
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
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											}
										);

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
						}

						$$renderer.push(`<!--]--></div>`);
					}
				}
			});
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}