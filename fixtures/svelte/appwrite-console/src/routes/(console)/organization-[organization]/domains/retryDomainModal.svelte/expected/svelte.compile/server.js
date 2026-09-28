import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { Input, InteractiveText, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
import { Link } from '$lib/elements';
import { consoleVariables } from '$routes/(console)/store';

export default function RetryDomainModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = void 0, selectedDomain } = $$props;
		const nameservers = $.store_get($$store_subs ??= {}, '$consoleVariables', consoleVariables)?._APP_DOMAINS_NAMESERVERS.split(',') ?? ['ns1.appwrite.io', 'ns2.appwrite.io'];
		let error = null;

		async function retryDomain() {
			try {
				error = null;

				const domain = await sdk.forConsole.domains.verifyNameservers({ domainId: selectedDomain.$id });

				await Promise.all([
					invalidate(Dependencies.DOMAIN),
					invalidate(Dependencies.DOMAINS)
				]);

				const verified = domain?.nameservers.toLowerCase() === 'appwrite';

				if (!verified) {
					throw new Error('Domain verification failed. Please check your domain settings or try again later');
				}

				show = false;
				addNotification({ type: 'success', message: 'Domain verified successfully' });
				trackEvent(Submit.DomainUpdateVerification);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.DomainUpdateVerification);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Retry verification',
				onSubmit: retryDomain,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

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
														$$renderer.push(`<!---->${$.escape(selectedDomain.domain)}`);
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

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										variant: 'm-400',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Add the following nameservers on your DNS provider. Note that DNS changes may take up to
            48 hours to propagate fully.`);
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
							columns: 2,
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { root }) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(nameservers);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let nameserver = each_array[$$index];

										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															root,
															column: 'ns',
															children: ($$renderer) => {
																$$renderer.push(`<!---->NS`);
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
															column: 'action',
															children: ($$renderer) => {
																InteractiveText($$renderer, { variant: 'copy', isVisible: true, text: nameserver });
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
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Retry`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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

		$.bind_props($$props, { show });
	});
}