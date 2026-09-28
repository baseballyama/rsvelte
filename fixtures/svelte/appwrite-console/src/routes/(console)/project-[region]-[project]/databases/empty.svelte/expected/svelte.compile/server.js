import * as $ from 'svelte/internal/server';
import { app } from '$lib/stores/app';
import { Card } from '$lib/components';
import { IconArrowRight } from '@appwrite.io/pink-icons-svelte';
import { Layout, Typography, Icon, Divider } from '@appwrite.io/pink-svelte';
import TablesDB from './(assets)/tables-db.svg';
import TablesDBDark from './(assets)/dark/tables-db.svg';
import DocumentsDB from './(assets)/documents-db.svg';
import DocumentsDBDark from './(assets)/dark/documents-db.svg';
import VectorsDB from './(assets)/vectors-db.svg';
import VectorsDBDark from './(assets)/dark/vectors-db.svg';
import { isSmallViewport } from '$lib/stores/viewport';
import { flags } from '$lib/flags';
import { user } from '$lib/stores/user';
import { organization } from '$lib/stores/organization';

export default function Empty($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/*import MongoDB from './(assets)/mongo-db.svg';
		import MongoDBDark from './(assets)/dark/mongo-db.svg';*/
		const { disabled, onDatabaseTypeSelected } = $$props;

		const isDark = $.derived(() => $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark');

		/*const mongoDbImage = $derived(isDark ? MongoDBDark : MongoDB);*/
		const tablesDbImage = $.derived(() => isDark() ? TablesDBDark : TablesDB);

		const documentsDbImage = $.derived(() => isDark() ? DocumentsDBDark : DocumentsDB);
		const vectorsDbImage = $.derived(() => isDark() ? VectorsDBDark : VectorsDB);

		function mainContentView($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					direction: 'column',
					gap: 'xxl',
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'none',
								direction: 'column',
								alignItems: 'center',
								alignContent: 'center',
								children: ($$renderer) => {
									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create your first database`);
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
											variant: 'l-400',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Store, organize, and manage your app data`);
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

						if (Layout.Grid) {
							$$renderer.push('<!--[-->');

							Layout.Grid($$renderer, {
								columns: 3,
								columnsS: 2,
								columnsXS: 1,
								gap: 'xl',
								children: ($$renderer) => {
									databaseTypeCard($$renderer, {
										type: 'tablesdb',
										title: 'TablesDB',
										subtitle: 'Structure your data in rows and columns. Best for relational data and advanced querying.',
										image: tablesDbImage()
									});

									$$renderer.push(`<!----> `);

									if (flags.multiDb({
										account: $.store_get($$store_subs ??= {}, '$user', user),
										organization: $.store_get($$store_subs ??= {}, '$organization', organization)
									})) {
										$$renderer.push('<!--[0-->');

										databaseTypeCard($$renderer, {
											type: 'documentsdb',
											title: 'DocumentsDB',
											subtitle: 'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
											image: documentsDbImage()
										});

										$$renderer.push(`<!----> `);

										databaseTypeCard($$renderer, {
											type: 'vectorsdb',
											title: 'VectorsDB',
											subtitle: 'Store data as vectors to find similar results. Best for semantic search and recommendations.',
											image: vectorsDbImage()
										});

										$$renderer.push(`<!---->`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		function databaseTypeCard($$renderer, { type, title, subtitle, image = undefined }) {
			Card($$renderer, {
				isButton: true,
				radius: 's',
				padding: 'none',
				disabled,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'none',
							direction: 'column',
							children: ($$renderer) => {
								$$renderer.push(`<img${$.attr('src', image)} class="database-image adaptive-height svelte-19miacw" alt="database type artwork"/> `);
								Divider($$renderer, {});
								$$renderer.push(`<!----> `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xxs',
										direction: 'column',
										justifyContent: 'space-between',
										style: 'padding: var(--gap-xl); flex: 1;',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'column',
													gap: 'xxs',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																inline: true,
																direction: 'row',
																alignItems: 'center',
																justifyContent: 'space-between',
																children: ($$renderer) => {
																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 's',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(title)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	Icon($$renderer, {
																		size: 'm',
																		icon: IconArrowRight,
																		color: '--fgcolor-neutral-tertiary'
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

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'l-400',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(subtitle)}`);
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
		}

		if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
			$$renderer.push('<!--[0-->');
			mainContentView($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');

			Card($$renderer, {
				padding: 'l',
				radius: 'l',
				children: ($$renderer) => {
					mainContentView($$renderer);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}