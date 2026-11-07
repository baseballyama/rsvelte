import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base, resolve } from '$app/paths';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { isVerifyEmailRedirectError } from '$lib/helpers/emailVerification';
import { Container } from '$lib/layout';
import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isPaymentError = $.derived(() => page.status === 402);

		const billingUrl = $.derived(() => page.params.organization
			? `${base}/organization-${page.params.organization}/billing`
			: null);

		if (isPaymentError()) {
			$$renderer.push(`<!--[0--><section class="budget-error svelte-1sj2ks6"><div class="budget-error__content svelte-1sj2ks6">`);

			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					gap: 's',
					alignItems: 'center',
					children: ($$renderer) => {
						Badge($$renderer, {
							type: 'error',
							variant: 'secondary',
							content: 'Billing limit reached'
						});

						$$renderer.push(`<!----> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xs',
								alignItems: 'center',
								children: ($$renderer) => {
									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											size: 'l',
											align: 'center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Your organization has reached a billing limit`);
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
											align: 'center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(page.error.message)}`);
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

						$$renderer.push(` <div class="u-margin-block-start-16">`);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								gap: 's',
								justifyContent: 'center',
								children: ($$renderer) => {
									if (billingUrl()) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											href: billingUrl(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Go to billing`);
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									Button($$renderer, {
										secondary: true,
										href: `${$.stringify(base)}/account/organizations`,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Change organization`);
										},
										$$slots: { default: true }
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

						$$renderer.push(`</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');

			Container($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div>`);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							size: 'xl',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape('status' in page.error
									? page.error.status || 'Invalid Argument'
									: 'Invalid Argument')}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page.error.message)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div>`);

					Button($$renderer, {
						href: base,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Back to the console`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}