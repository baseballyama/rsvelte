import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { resolveRoute } from '$lib/stores/navigation';
import { canWriteDatabases } from '$lib/stores/roles';
import { Badge, Icon, Layout } from '@appwrite.io/pink-svelte';
import { CardContainer, GridItem1, Id } from '$lib/components';
import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
import { getDatabaseTypeTitle } from '$routes/(console)/project-[region]-[project]/databases/store';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> No backup policies`, 1);
var root_2 = $.from_html(`<p>Create a database</p>`);

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteDatabases = () => $.store_get(canWriteDatabases, '$canWriteDatabases', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function getDatabaseRoute(database) {
		return resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: database.$id });
	}

	{
		let $0 = $.derived(() => !$canWriteDatabases());

		CardContainer($$anchor, {
			get total() {
				return $$props.data.databases.total;
			},

			get disableEmpty() {
				return $.get($0);
			},
			event: 'database',
			service: 'databases',
			$$events: {
				click: function (...$$args) {
					$$props.onCreateDatabaseClick?.apply(this, $$args);
				}
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 17, () => $$props.data.databases.databases, $.index, ($$anchor, database) => {
					{
						let $0 = $.derived(() => getDatabaseRoute($.get(database)));

						GridItem1($$anchor, {
							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Id($$anchor, {
									get value() {
										return $.get(database).$id;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(database).$id));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								title: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_1 = $.first_child(fragment_5);

									$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											inline: true,
											direction: 'row',
											gap: 's',
											alignItems: 'center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_6 = root();
												var text_1 = $.first_child(fragment_6);
												var node_2 = $.sibling(text_1);

												{
													let $0 = $.derived(() => getDatabaseTypeTitle($.get(database)));

													Badge(node_2, {
														size: 'xs',
														variant: 'secondary',
														get content() {
															return $.get($0);
														}
													});
												}

												$.template_effect(() => $.set_text(text_1, `${$.get(database).name ?? ''} `));
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},

								subtitle: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_3 = $.first_child(fragment_7);

									{
										var consequent = ($$anchor) => {
											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, `Last backup: ${$$props.data.lastBackups[$.get(database).$id] ?? ''}`));
											$.append($$anchor, text_2);
										};

										var consequent_1 = ($$anchor) => {
											var fragment_9 = $.comment();
											var node_4 = $.first_child(fragment_9);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													inline: true,
													direction: 'row',
													gap: 's',
													alignItems: 'center',
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_1();
														var node_5 = $.first_child(fragment_10);

														Icon(node_5, {
															get icon() {
																return IconExclamation;
															},
															size: 's',
															color: '--bgcolor-warning'
														});

														$.next();
														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										};

										var alternate = ($$anchor) => {
											var text_3 = $.text('Last backup: No backups yet');

											$.append($$anchor, text_3);
										};

										$.if(node_3, ($$render) => {
											if ($$props.data.lastBackups && $$props.data.lastBackups[$.get(database).$id]) $$render(consequent); else if (!$$props.data.policies || !$$props.data.policies[$.get(database).$id]) $$render(consequent_1, 1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_7);
								}
							}
						});
					}
				});

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				empty: ($$anchor, $$slotProps) => {
					var p = root_2();

					$.append($$anchor, p);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}