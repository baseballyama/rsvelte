import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputText } from '$lib/elements/forms';
import Button from '$lib/elements/forms/button.svelte';
import { debounce } from '$lib/helpers/debounce';
import { sdk } from '$lib/stores/sdk';
import { ConsoleResourceType } from '@appwrite.io/console';
import { Fieldset, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';

var root = $.from_html(`<!> <!>`, 1);

export default function Domain($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let domain = $.prop($$props, 'domain', 15),
		domainIsValid = $.prop($$props, 'domainIsValid', 15, true);

	const originalDomain = domain();
	let newDomain = $.state($.proxy(domain()));
	let domainStatus = $.state($.proxy(domain() ? 'pending' : 'complete'));

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
				$.set(domainStatus, 'failed');
				domainIsValid(false);
				domain($.get(newDomain));

				return;
			}

			try {
				await sdk.forConsole.console.getResource({
					value: `${value}.${$regionalConsoleVariables()._APP_DOMAIN_SITES}`,
					type: ConsoleResourceType.Rules
				});

				$.set(domainStatus, 'complete');
				domainIsValid(true);
			} catch {
				$.set(domainStatus, 'failed');
				domainIsValid(false);
			} finally {
				domain($.get(newDomain));
			}
		},
		500
	);

	$.user_effect(() => {
		domainIsValid(); /* silences lint for unused var */

		if ($.get(newDomain)) {
			if (domain() !== $.get(newDomain)) {
				$.set(domainStatus, 'pending');
			}

			checkDomain($.get(newDomain));
		}
	});

	Fieldset($$anchor, {
		legend: 'Domains',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 's',
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									InputText(node_2, {
										id: 'domain',
										placeholder: 'my-domain',
										get value() {
											return $.get(newDomain);
										},

										set value($$value) {
											$.set(newDomain, $$value, true);
										},

										$$slots: {
											end: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														variant: 'm-400',
														color: '--fgcolor-neutral-tertiary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, `.${$regionalConsoleVariables()._APP_DOMAIN_SITES ?? ''}`));
															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											}
										}
									});

									var node_4 = $.sibling(node_2, 2);

									{
										let $0 = $.derived(() => originalDomain === $.get(newDomain));

										Button(node_4, {
											secondary: true,
											get disabled() {
												return $.get($0);
											},
											$$events: { click: () => $.set(newDomain, originalDomain, true) },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Reset');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => setDomainLabel($.get(domainStatus)));

									Status($$anchor, {
										get status() {
											return $.get(domainStatus);
										},

										get label() {
											return $.get($0);
										}
									});
								}
							};

							$.if(node_5, ($$render) => {
								if ($.get(newDomain)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}