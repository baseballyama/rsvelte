import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	Wizard($$anchor, {
		title: 'Add domain',
		get href() {
			return backPage;
		},
		column: true,
		columnSize: 's',
		hideFooter: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					RecordsCard($$anchor, {
						get domain() {
							return domain;
						}
					});
				};

				var alternate = ($$anchor) => {
					Fieldset($$anchor, {
						legend: 'Configuration',
						children: ($$anchor, $$slotProps) => {
							Form($$anchor, {
								onSubmit: addDomain,
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_1 = $.first_child(fragment_5);

									$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											gap: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_2 = $.first_child(fragment_6);

												InputDomain(node_2, {
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
													}
												});

												var node_3 = $.sibling(node_2, 2);

												Divider(node_3, {});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														alignItems: 'flex-end',
														children: ($$anchor, $$slotProps) => {
															Button($$anchor, {
																submit: true,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text('Add');

																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if (domain) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}