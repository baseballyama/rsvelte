import * as $ from 'svelte/internal/server';
import Base from './base.svelte';
import { isCloud } from '$lib/system';
import { getChangePlanUrl } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import Button from '$lib/elements/forms/button.svelte';
import { Badge, Layout, Link, Typography } from '@appwrite.io/pink-svelte';

export default function Upgrade($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Base($$renderer, {
			children: ($$renderer) => {
				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						gap: 's',
						children: ($$renderer) => {
							if (isCloud) {
								$$renderer.push('<!--[0-->');

								if ($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDetails.supportsOrganizationRoles) {
									$$renderer.push('<!--[0-->');

									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											variant: 'm-600',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Roles`);
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
											children: ($$renderer) => {
												$$renderer.push(`<!---->Owner, Developer, Editor, Analyst and Billing.`);
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
											children: ($$renderer) => {
												if (Link.Anchor) {
													$$renderer.push('<!--[-->');

													Link.Anchor($$renderer, {
														target: '_blank',
														rel: 'noopener noreferrer',
														href: 'https://appwrite.io/docs/advanced/platform/roles',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Learn more`);
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

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											gap: 's',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-600',
														children: ($$renderer) => {
															$$renderer.push(`<span class="u-bold">Roles</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);
												Badge($$renderer, { variant: 'secondary', size: 'xs', content: 'Pro plan' });
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

									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Upgrade to Pro to assign new roles to members such as Owner, Developer, Editor
                    or Analyst.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <p class="u-flex u-main-end u-cross-center u-gap-4">`);

									Button($$renderer, {
										size: 's',
										text: true,
										external: true,
										href: 'https://appwrite.io/docs/advanced/platform/roles',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Learn more`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										size: 's',
										secondary: true,
										external: true,
										href: getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization)?.$id),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upgrade plan`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></p>`);
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 's',
										children: ($$renderer) => {
											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'm-600',
													children: ($$renderer) => {
														$$renderer.push(`<span class="u-bold">Roles</span>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Badge($$renderer, { variant: 'secondary', size: 'xs', content: 'Cloud' });
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

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upgrade to Cloud to assign new roles to members or ask us about our enterprise self
                hosted offering.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <p class="u-flex u-main-end u-cross-center u-gap-4">`);

								Button($$renderer, {
									size: 's',
									text: true,
									external: true,
									href: 'https://appwrite.io/docs/advanced/platform/roles',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Learn more`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									size: 's',
									secondary: true,
									external: true,
									href: getChangePlanUrl($.store_get($$store_subs ??= {}, '$organization', organization)?.$id),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Upgrade to Cloud`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></p>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}