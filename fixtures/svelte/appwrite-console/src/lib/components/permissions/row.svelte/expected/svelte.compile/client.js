import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div>Users</div>`);
var root_1 = $.from_html(`<div>Guests</div>`);
var root_2 = $.from_html(`<div>Any</div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<button type="button"><!> <!></button>`);
var root_5 = $.from_html(`<div slot="tooltip" role="tooltip" class="popover svelte-1femmhr"><!></div>`);

export default function Row($$anchor, $$props) {
	$.push($$props, true);

	const $menuOpen = () => $.store_get(menuOpen, '$menuOpen', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const permissionDataCache = new Map();
	let placement = $.prop($$props, 'placement', 3, 'bottom-start');

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
			const data = await getData($$props.role);

			if (data?.notFound) {
				$$props.onNotFound?.($$props.role);
			}
		} catch {
			// Intentionally ignore fetch/parse errors; UI handles missing data state
		}
	}

	onMount(() => {
		verifyExistence();
	});

	let isMouseOverTooltip = $.state(false);

	function hidePopover(hideTooltip, timeout = true) {
		if (!timeout) {
			$.set(isMouseOverTooltip, false);

			return hideTooltip();
		}

		setTimeout(
			() => {
				if (!$.get(isMouseOverTooltip)) {
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		};

		var alternate_4 = ($$anchor) => {
			Popover($$anchor, {
				get placement() {
					return placement();
				},
				portal: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const show = $.derived(() => $$slotProps.show);
						const hide = $.derived(() => $$slotProps.hide);
						var button = root_4();
						var node_1 = $.child(button);

						$.snippet(node_1, () => $$props.children ?? $.noop);

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										style: 'text-decoration: underline;',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(($0) => $.set_text(text, $0), [() => formatName($$props.role, $isSmallViewport() ? 8 : 15)]);
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							var d = $.derived(() => isCustomPermission($$props.role));

							var alternate = ($$anchor) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
									Layout_Stack($$anchor, {
										direction: 'row',
										gap: 's',
										alignItems: 'center',
										inline: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_3();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_1) => {
												Typography_Text_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.await(
															node_6,
															() => getData($$props.role),
															($$anchor) => {
																var text_2 = $.text();

																$.template_effect(() => $.set_text(text_2, $$props.role));
																$.append($$anchor, text_2);
															},
															($$anchor, data) => {
																var text_1 = $.text();

																$.template_effect(($0) => $.set_text(text_1, $0), [
																	() => formatName($.get(data).name ?? $.get(data)?.email ?? $.get(data)?.phone ?? '-', $isSmallViewport() ? 16 : 20)
																]);

																$.append($$anchor, text_1);
															}
														);

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_5, 2);

											{
												let $0 = $.derived(() => $$props.role.startsWith('user') ? 'User' : 'Team');

												Badge(node_7, {
													size: 'xs',
													variant: 'secondary',
													get content() {
														return $.get($0);
													}
												});
											}

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							};

							$.if(node_2, ($$render) => {
								if ($.get(d)) $$render(consequent_3); else $$render(alternate, -1);
							});
						}

						$.reset(button);
						$.delegated('click', button, (e) => e.stopPropagation());
						$.delegated('keydown', button, (e) => e.stopPropagation());

						$.event('mouseenter', button, () => {
							if (!$menuOpen()) {
								setTimeout($.get(show), 150);
							}
						});

						$.event('mouseleave', button, () => hidePopover($.get(hide)));
						$.append($$anchor, button);
					},

					tooltip: ($$anchor, $$slotProps) => {
						const hide = $.derived(() => $$slotProps.hide);
						const showing = $.derived(() => $$slotProps.showing);
						var div_3 = root_5();
						var node_8 = $.child(div_3);

						{
							var consequent_11 = ($$anchor) => {
								var fragment_9 = $.comment();
								var node_9 = $.first_child(fragment_9);

								$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										gap: 's',
										alignContent: 'flex-start',
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_10 = $.first_child(fragment_10);

											$.await(
												node_10,
												() => getData($$props.role),
												($$anchor) => {
													var fragment_39 = $.comment();
													var node_34 = $.first_child(fragment_39);

													$.component(node_34, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
														Layout_Stack_11($$anchor, {
															alignItems: 'center',
															children: ($$anchor, $$slotProps) => {
																Spinner($$anchor, {});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_39);
												},
												($$anchor, data) => {
													var fragment_11 = $.comment();
													var node_11 = $.first_child(fragment_11);

													{
														var consequent_5 = ($$anchor) => {
															var fragment_12 = $.comment();
															var node_12 = $.first_child(fragment_12);

															$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																Layout_Stack_2($$anchor, {
																	gap: 's',
																	alignItems: 'flex-start',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = $.comment();
																		var node_13 = $.first_child(fragment_13);

																		$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																			Layout_Stack_3($$anchor, {
																				direction: 'row',
																				gap: 's',
																				alignItems: 'center',
																				justifyContent: 'flex-start',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root_3();
																					var node_14 = $.first_child(fragment_14);

																					Avatar(node_14, {
																						alt: 'avatar',
																						size: 'm',
																						children: ($$anchor, $$slotProps) => {
																							Icon($$anchor, {
																								get icon() {
																									return IconMinusSm;
																								},
																								size: 's'
																							});
																						},
																						$$slots: { default: true }
																					});

																					var node_15 = $.sibling(node_14, 2);

																					$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																						Layout_Stack_4($$anchor, {
																							alignItems: 'flex-start',
																							gap: 'xxs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_16 = root_3();
																								var node_16 = $.first_child(fragment_16);

																								$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																									Layout_Stack_5($$anchor, {
																										style: 'padding-left: 0.25rem;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_17 = $.comment();
																											var node_17 = $.first_child(fragment_17);

																											$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																												Typography_Text_2($$anchor, {
																													size: 'm',
																													color: '--fgcolor-neutral-primary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_3 = $.text();

																														$.template_effect(($0) => $.set_text(text_3, $0), [
																															() => formatName($.get(data).customName ?? '', $isSmallViewport() ? 20 : 28)
																														]);

																														$.append($$anchor, text_3);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_17);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_18 = $.sibling(node_16, 2);

																								{
																									var consequent_4 = ($$anchor) => {
																										{
																											let $0 = $.derived(() => formatName($.get(data).roleName, $isSmallViewport() ? 20 : 28));

																											InteractiveText($$anchor, {
																												isVisible: true,
																												variant: 'copy',
																												get text() {
																													return $.get($0);
																												},

																												get value() {
																													return $.get(data).roleName;
																												}
																											});
																										}
																									};

																									var alternate_1 = ($$anchor) => {
																										{
																											let $0 = $.derived(() => formatName($$props.role, $isSmallViewport() ? 20 : 28));

																											InteractiveText($$anchor, {
																												isVisible: true,
																												variant: 'copy',
																												get text() {
																													return $.get($0);
																												},

																												get value() {
																													return $$props.role;
																												}
																											});
																										}
																									};

																									$.if(node_18, ($$render) => {
																										if ($.get(data).roleName) $$render(consequent_4); else $$render(alternate_1, -1);
																									});
																								}

																								$.append($$anchor, fragment_16);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														};

														var alternate_3 = ($$anchor) => {
															const isUser = $.derived(() => $$props.role.startsWith('user'));
															const isAnonymous = $.derived(() => !$.get(data).email && !$.get(data).phone && !$.get(data).name && $.get(isUser));
															const parsed = $.derived(() => parsePermission($$props.role));
															const id = $.derived(() => $.get(parsed).id);
															var fragment_21 = $.comment();
															var node_19 = $.first_child(fragment_21);

															$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																Layout_Stack_6($$anchor, {
																	gap: 's',
																	alignItems: 'flex-start',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_22 = root_3();
																		var node_20 = $.first_child(fragment_22);

																		$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																			Layout_Stack_7($$anchor, {
																				direction: 'row',
																				gap: 's',
																				alignItems: 'center',
																				justifyContent: 'flex-start',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_23 = root_3();
																					var node_21 = $.first_child(fragment_23);

																					{
																						var consequent_6 = ($$anchor) => {
																							Avatar($$anchor, {
																								alt: 'avatar',
																								size: 'm',
																								children: ($$anchor, $$slotProps) => {
																									Icon($$anchor, {
																										get icon() {
																											return IconAnonymous;
																										},
																										size: 's'
																									});
																								},
																								$$slots: { default: true }
																							});
																						};

																						var consequent_7 = ($$anchor) => {
																							AvatarInitials($$anchor, {
																								get name() {
																									return $.get(data).name;
																								},
																								size: 'm'
																							});
																						};

																						var alternate_2 = ($$anchor) => {
																							Avatar($$anchor, {
																								alt: 'avatar',
																								size: 'm',
																								children: ($$anchor, $$slotProps) => {
																									Icon($$anchor, {
																										get icon() {
																											return IconMinusSm;
																										},
																										size: 's'
																									});
																								},
																								$$slots: { default: true }
																							});
																						};

																						$.if(node_21, ($$render) => {
																							if ($.get(isAnonymous)) $$render(consequent_6); else if ($.get(data).name) $$render(consequent_7, 1); else $$render(alternate_2, -1);
																						});
																					}

																					var node_22 = $.sibling(node_21, 2);

																					$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																						Layout_Stack_8($$anchor, {
																							alignItems: 'flex-start',
																							gap: 'xxs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_29 = root_3();
																								var node_23 = $.first_child(fragment_29);

																								$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																									Layout_Stack_9($$anchor, {
																										style: 'padding-left: 0.25rem;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_30 = $.comment();
																											var node_24 = $.first_child(fragment_30);

																											{
																												let $0 = $.derived(() => $$props.role.startsWith('user')
																													? `${base}/project-${page.params.region}-${page.params.project}/auth/user-${$.get(id)}`
																													: `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${$.get(id)}`);

																												$.component(node_24, () => Link.Anchor, ($$anchor, Link_Anchor) => {
																													Link_Anchor($$anchor, {
																														variant: 'quiet',
																														get href() {
																															return $.get($0);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_31 = $.comment();
																															var node_25 = $.first_child(fragment_31);

																															$.component(node_25, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																																Typography_Text_3($$anchor, {
																																	size: 'm',
																																	color: '--fgcolor-neutral-primary',
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_4 = $.text();

																																		$.template_effect(($0) => $.set_text(text_4, $0), [
																																			() => formatName($.get(data).name ?? $.get(data)?.email ?? $.get(data)?.phone ?? '-', $isSmallViewport() ? 18 : 24)
																																		]);

																																		$.append($$anchor, text_4);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_31);
																														},
																														$$slots: { default: true }
																													});
																												});
																											}

																											$.append($$anchor, fragment_30);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_26 = $.sibling(node_23, 2);

																								InteractiveText(node_26, {
																									isVisible: true,
																									variant: 'copy',
																									get text() {
																										return $.get(id);
																									},

																									get value() {
																										return $.get(id);
																									}
																								});

																								$.append($$anchor, fragment_29);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_23);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_27 = $.sibling(node_20, 2);

																		{
																			var consequent_10 = ($$anchor) => {
																				var fragment_33 = root_3();
																				var node_28 = $.first_child(fragment_33);

																				Divider(node_28, {});

																				var node_29 = $.sibling(node_28, 2);

																				$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																					Layout_Stack_10($$anchor, {
																						gap: 'xxs',
																						alignItems: 'flex-start',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_34 = root_3();
																							var node_30 = $.first_child(fragment_34);

																							{
																								var consequent_8 = ($$anchor) => {
																									var fragment_35 = $.comment();
																									var node_31 = $.first_child(fragment_35);

																									$.component(node_31, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																										Typography_Caption($$anchor, {
																											variant: '400',
																											color: '--fgcolor-neutral-secondary',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_5 = $.text();

																												$.template_effect(($0) => $.set_text(text_5, `Email: ${$0 ?? ''}`), [
																													() => formatName($.get(data).email, $isSmallViewport() ? 24 : 32)
																												]);

																												$.append($$anchor, text_5);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_35);
																								};

																								$.if(node_30, ($$render) => {
																									if ($.get(data).email) $$render(consequent_8);
																								});
																							}

																							var node_32 = $.sibling(node_30, 2);

																							{
																								var consequent_9 = ($$anchor) => {
																									var fragment_37 = $.comment();
																									var node_33 = $.first_child(fragment_37);

																									$.component(node_33, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
																										Typography_Caption_1($$anchor, {
																											variant: '400',
																											color: '--fgcolor-neutral-secondary',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_6 = $.text();

																												$.template_effect(() => $.set_text(text_6, `Phone: ${$.get(data).phone ?? ''}`));
																												$.append($$anchor, text_6);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_37);
																								};

																								$.if(node_32, ($$render) => {
																									if ($.get(data).phone) $$render(consequent_9);
																								});
																							}

																							$.append($$anchor, fragment_34);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_33);
																			};

																			$.if(node_27, ($$render) => {
																				if ($.get(isUser) && ($.get(data).email || $.get(data).phone)) $$render(consequent_10);
																			});
																		}

																		$.append($$anchor, fragment_22);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_21);
														};

														$.if(node_11, ($$render) => {
															if ($.get(data).notFound) $$render(consequent_5); else $$render(alternate_3, -1);
														});
													}

													$.append($$anchor, fragment_11);
												}
											);

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_9);
							};

							$.if(node_8, ($$render) => {
								if ($.get(showing)) $$render(consequent_11);
							});
						}

						$.reset(div_3);
						$.event('mouseenter', div_3, () => $.set(isMouseOverTooltip, true));
						$.event('mouseleave', div_3, () => hidePopover($.get(hide), false));
						$.append($$anchor, div_3);
					}
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.role === 'users') $$render(consequent); else if ($$props.role === 'guests') $$render(consequent_1, 1); else if ($$props.role === 'any') $$render(consequent_2, 2); else $$render(alternate_4, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keydown']);