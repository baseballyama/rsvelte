import * as $ from 'svelte/internal/server';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getProxyRuleStatusBadge } from './status';
import { Badge, Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';

export default function NameserverTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { domain, verified, ruleStatus } = $$props;

		const nameserverList = $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)?._APP_DOMAINS_NAMESERVERS
			? $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)?._APP_DOMAINS_NAMESERVERS?.split(',')
			: ['ns1.appwrite.io', 'ns2.appwrite.io'];

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
											$$renderer.push(`<!---->${$.escape(domain)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (verified !== undefined) {
									$$renderer.push('<!--[0-->');

									const statusBadge = getProxyRuleStatusBadge(ruleStatus);

									if (statusBadge) {
										$$renderer.push('<!--[0-->');

										Badge($$renderer, {
											variant: 'secondary',
											type: statusBadge.type,
											size: 'xs',
											content: statusBadge.content
										});
									} else if (verified === true) {
										$$renderer.push('<!--[1-->');

										Badge($$renderer, {
											variant: 'secondary',
											type: 'success',
											size: 'xs',
											content: 'Verified'
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
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

					$$renderer.push(` `);

					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							variant: 'm-400',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Add the following nameservers on your DNS provider. Note that DNS changes may take up to 48
        hours to propagate fully.`);
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

						const each_array = $.ensure_array_like(nameserverList);

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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}