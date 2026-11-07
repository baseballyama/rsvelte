import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { Button, Form } from '$lib/elements/forms';
import { InputDomain } from '$lib/elements/forms/index.js';
import { Wizard } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Divider, Fieldset, Layout } from '@appwrite.io/pink-svelte';
import RecordsCard from '../recordsCard.svelte';
import { afterNavigate, invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let backPage = `${base}/organization-${page.params.organization}/domains`;
		let domainName = '';
		let domain;

		async function addDomain() {
			try {
				domain = await sdk.forConsole.domains.create({
					teamId: page.params.organization,
					domain: domainName.toLocaleLowerCase()
				});

				await invalidate(Dependencies.DOMAINS);

				const verified = domain.nameservers.toLowerCase() === 'appwrite';

				if (verified) {
					await goto(backPage);
					addNotification({ type: 'success', message: 'Domain verified successfully' });
				}
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		afterNavigate(({ from }) => {
			backPage = from.url?.pathname ?? `${base}/`;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Add domain',
				href: backPage,
				column: true,
				columnSize: 's',
				hideFooter: true,
				children: ($$renderer) => {
					if (domain) {
						$$renderer.push('<!--[0-->');
						RecordsCard($$renderer, { domain });
					} else {
						$$renderer.push('<!--[-1-->');

						Fieldset($$renderer, {
							legend: 'Configuration',
							children: ($$renderer) => {
								Form($$renderer, {
									onSubmit: addDomain,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												children: ($$renderer) => {
													InputDomain($$renderer, {
														label: 'Domain',
														id: 'domain',
														name: 'domain',
														required: true,
														autofocus: true,
														placeholder: 'example.com',
														get value() {
															return domainName;
														},

														set value($$value) {
															domainName = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);
													Divider($$renderer, {});
													$$renderer.push(`<!----> `);

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															alignItems: 'flex-end',
															children: ($$renderer) => {
																Button($$renderer, {
																	submit: true,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Add`);
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
					}

					$$renderer.push(`<!--]-->`);
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
	});
}