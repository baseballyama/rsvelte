import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { currentPlan } from '$lib/stores/organization';

import {
	ActionMenu,
	Popover,
	Layout,
	Selector,
	Tag,
	Tooltip,
	Typography,
	Link
} from '@appwrite.io/pink-svelte';

export default function EncryptCheckbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			encrypt = false,
			editing = false,
			disabled = false,
			id = 'encrypt'
		} = $$props;

		const organizationId = page.data?.organization?.$id ?? page.data?.project?.teamId;

		const supportsEncryption = $.derived(() => isCloud
			? $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.databasesAllowEncrypt
			: true);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Tooltip($$renderer, {
				disabled: !(editing || disabled),
				maxWidth: '275px',
				placement: 'bottom-start',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class('popover-holder svelte-pdauwr', void 0, {
						'cursor-not-allowed': editing || disabled,
						'disabled-checkbox': !supportsEncryption() || editing || disabled
					})}>`);

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							inline: true,
							gap: 's',
							alignItems: 'flex-start',
							direction: 'row',
							children: ($$renderer) => {
								Popover($$renderer, {
									placement: 'bottom-start',
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { toggle }) => {
											if (Selector.Checkbox) {
												$$renderer.push('<!--[-->');

												Selector.Checkbox($$renderer, {
													size: 's',
													id,
													disabled: !supportsEncryption() || editing || disabled,
													get checked() {
														return encrypt;
													},

													set checked($$value) {
														encrypt = $$value;
														$$settled = false;
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
													gap: 'xxs',
													direction: 'column',
													children: ($$renderer) => {
														$$renderer.push(`<button type="button"${$.attr('disabled', editing || disabled, true)}${$.attr_class('svelte-pdauwr', void 0, {
															'cursor-pointer': !(editing || disabled),
															'cursor-not-allowed': editing || disabled
														})}>`);

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																inline: true,
																gap: 'xxs',
																direction: 'row',
																alignItems: 'center',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-500',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Encrypted`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (!supportsEncryption()) {
																		$$renderer.push('<!--[0-->');

																		Tag($$renderer, {
																			variant: 'default',
																			size: 'xs',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Pro`);
																			},
																			$$slots: { default: true }
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

														$$renderer.push(`</button> `);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																color: '--fgcolor-neutral-tertiary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Protect column against data leaks for best privacy compliance. Encrypted
                        columns cannot be queried.`);
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

										tooltip: ($$renderer) => {
											if (ActionMenu.Root) {
												$$renderer.push('<!--[-->');

												ActionMenu.Root($$renderer, {
													width: '180px',
													slot: 'tooltip',
													children: ($$renderer) => {
														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-500',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Available on Pro plan. `);

																	if (Link.Anchor) {
																		$$renderer.push('<!--[-->');

																		Link.Anchor($$renderer, {
																			href: getChangePlanUrl(organizationId),
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Upgrade`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` to enable encrypted columns.`);
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
									}
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},

				$$slots: {
					default: true,
					tooltip: ($$renderer) => {
						{
							$$renderer.push(`Encryption can only be set when creating the column.`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { encrypt });
	});
}