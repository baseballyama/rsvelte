import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { getProxyRuleStatusBadge } from './status';
import { Badge, Layout, Typography, Table, InteractiveText } from '@appwrite.io/pink-svelte';

var root_1 = $.from_html(`<!> <!>`, 1);

export default function NameserverTable($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const nameserverList = $regionalConsoleVariables()?._APP_DOMAINS_NAMESERVERS
		? $regionalConsoleVariables()?._APP_DOMAINS_NAMESERVERS?.split(',')
		: ['ns1.appwrite.io', 'ns2.appwrite.io'];

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 's',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						gap: 's',
						direction: 'row',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									variant: 'l-500',
									color: '--fgcolor-neutral-primary',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $$props.domain));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							{
								var consequent_2 = ($$anchor) => {
									const statusBadge = $.derived(() => getProxyRuleStatusBadge($$props.ruleStatus));
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										var consequent = ($$anchor) => {
											Badge($$anchor, {
												variant: 'secondary',
												get type() {
													return $.get(statusBadge).type;
												},
												size: 'xs',
												get content() {
													return $.get(statusBadge).content;
												}
											});
										};

										var consequent_1 = ($$anchor) => {
											Badge($$anchor, {
												variant: 'secondary',
												type: 'success',
												size: 'xs',
												content: 'Verified'
											});
										};

										$.if(node_4, ($$render) => {
											if ($.get(statusBadge)) $$render(consequent); else if ($$props.verified === true) $$render(consequent_1, 1);
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.if(node_3, ($$render) => {
									if ($$props.verified !== undefined) $$render(consequent_2);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_1) => {
					Typography_Text_1($$anchor, {
						variant: 'm-400',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Add the following nameservers on your DNS provider. Note that DNS changes may take up to 48\n        hours to propagate fully.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			columns: 2,
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const root = $.derived(() => $$slotProps.root);
					var fragment_7 = $.comment();
					var node_7 = $.first_child(fragment_7);

					$.each(node_7, 17, () => nameserverList, $.index, ($$anchor, nameserver) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						$.component(node_8, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
							Table_Row_Base($$anchor, {
								get root() {
									return $.get(root);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_9 = $.first_child(fragment_9);

									$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell) => {
										Table_Cell($$anchor, {
											get root() {
												return $.get(root);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('NS');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_1) => {
										Table_Cell_1($$anchor, {
											get root() {
												return $.get(root);
											},

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

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					});

					$.append($$anchor, fragment_7);
				},

				header: ($$anchor, $$slotProps) => {
					const root = $.derived(() => $$slotProps.root);
					var fragment_11 = root_1();
					var node_11 = $.first_child(fragment_11);

					$.component(node_11, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
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

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
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

					$.append($$anchor, fragment_11);
				}
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}