import * as $ from 'svelte/internal/server';
import { InputText } from '$lib/elements/forms';
import Button from '$lib/elements/forms/button.svelte';
import { debounce } from '$lib/helpers/debounce';
import { sdk } from '$lib/stores/sdk';
import { ConsoleResourceType } from '@appwrite.io/console';
import { Fieldset, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

export default function Domain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { domain = void 0, domainIsValid = true } = $$props;
		const originalDomain = domain;
		let newDomain = domain;
		let domainStatus = domain ? 'pending' : 'complete';

		function setDomainLabel(status) {
			switch (status) {
				case 'complete':
					return 'Domain is available';

				case 'failed':
					return 'Domain is not available';

				case 'pending':
					return 'Checking domain availability';
			}
		}

		const checkDomain = debounce(
			async (value) => {
				if (!value) {
					domainStatus = 'failed';
					domainIsValid = false;
					domain = newDomain;

					return;
				}

				try {
					await sdk.forConsole.console.getResource({
						value: `${value}.${$.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES}`,
						type: ConsoleResourceType.Rules
					});

					domainStatus = 'complete';
					domainIsValid = true;
				} catch {
					domainStatus = 'failed';
					domainIsValid = false;
				} finally {
					domain = newDomain;
				}
			},
			500
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Fieldset($$renderer, {
				legend: 'Domains',
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
											InputText($$renderer, {
												id: 'domain',
												placeholder: 'my-domain',
												get value() {
													return newDomain;
												},

												set value($$value) {
													newDomain = $$value;
													$$settled = false;
												},

												$$slots: {
													end: ($$renderer) => {
														{
															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-400',
																	color: '--fgcolor-neutral-tertiary',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->.${$.escape($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES)}`);
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

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												secondary: true,
												disabled: originalDomain === newDomain,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Reset`);
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

								$$renderer.push(` `);

								if (newDomain) {
									$$renderer.push('<!--[0-->');
									Status($$renderer, { status: domainStatus, label: setDomainLabel(domainStatus) });
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { domain, domainIsValid });
	});
}