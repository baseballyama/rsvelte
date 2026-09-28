import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`A list of all domain providers and their DNS setting is available <!>.`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function RetryDomainModal($$anchor, $$props) {
	$.push($$props, true);

	const $consoleVariables = () => $.store_get(consoleVariables, '$consoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = $.prop($$props, 'show', 15);
	const nameservers = $consoleVariables()?._APP_DOMAINS_NAMESERVERS.split(',') ?? ['ns1.appwrite.io', 'ns2.appwrite.io'];
	let error = $.state(null);

	async function retryDomain() {
		try {
			$.set(error, null);

			const domain = await sdk.forConsole.domains.verifyNameservers({ domainId: $$props.selectedDomain.$id });

			await Promise.all([
				invalidate(Dependencies.DOMAIN),
				invalidate(Dependencies.DOMAINS)
			]);

			const verified = domain?.nameservers.toLowerCase() === 'appwrite';

			if (!verified) {
				throw new Error('Domain verification failed. Please check your domain settings or try again later');
			}

			show(false);
			addNotification({ type: 'success', message: 'Domain verified successfully' });
			trackEvent(Submit.DomainUpdateVerification);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.DomainUpdateVerification);
		}
	}

	$.user_effect(() => {
		if (!show()) {
			$.set(error, null);
		}
	});

	Modal($$anchor, {
		title: 'Retry verification',
		onSubmit: retryDomain,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 's',
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											variant: 'l-500',
											color: '--fgcolor-neutral-primary',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $$props.selectedDomain.domain));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text_1) => {
							Typography_Text_1($$anchor, {
								variant: 'm-400',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Add the following nameservers on your DNS provider. Note that DNS changes may take up to\n            48 hours to propagate fully.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					columns: 2,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const root = $.derived(() => $$slotProps.root);
							var fragment_5 = $.comment();
							var node_5 = $.first_child(fragment_5);

							$.each(node_5, 17, () => nameservers, $.index, ($$anchor, nameserver) => {
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
									Table_Row_Base($$anchor, {
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_1();
											var node_7 = $.first_child(fragment_7);

											$.component(node_7, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													get root() {
														return $.get(root);
													},
													column: 'ns',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('NS');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => Table.Cell, ($$anchor, Table_Cell_1) => {
												Table_Cell_1($$anchor, {
													get root() {
														return $.get(root);
													},
													column: 'action',
													children: ($$anchor, $$slotProps) => {
														InteractiveText($$anchor, {
															variant: 'copy',
															isVisible: true,
															get text() {
																return $.get(nameserver);
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							});

							$.append($$anchor, fragment_5);
						},

						header: ($$anchor, $$slotProps) => {
							const root = $.derived(() => $$slotProps.root);
							var fragment_9 = root_1();
							var node_9 = $.first_child(fragment_9);

							$.component(node_9, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
								Table_Header_Cell($$anchor, {
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Type');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
								Table_Header_Cell_1($$anchor, {
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Value');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						}
					}
				});
			});

			var node_11 = $.sibling(node_4, 2);

			$.component(node_11, () => Input.Helper, ($$anchor, Input_Helper) => {
				Input_Helper($$anchor, {
					state: 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_10 = root_2();
						var node_12 = $.sibling($.first_child(fragment_10));

						Link(node_12, {
							variant: 'muted',
							external: true,
							href: 'https://appwrite.io/docs/advanced/platform/custom-domains',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('here');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						$.next();
						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_11 = root_1();
				var node_13 = $.first_child(fragment_11);

				Button(node_13, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Cancel');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					submit: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Retry');

						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_11);
			}
		}
	});

	$.pop();
	$$cleanup();
}