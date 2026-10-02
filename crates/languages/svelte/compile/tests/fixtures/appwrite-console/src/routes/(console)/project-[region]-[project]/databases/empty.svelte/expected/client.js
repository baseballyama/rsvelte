import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<img class="database-image adaptive-height svelte-19miacw" alt="database type artwork"/> <!> <!>`, 1);

export default function Empty($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $user = () => $.store_get(user, '$user', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const /*import MongoDB from './(assets)/mongo-db.svg';
	import MongoDBDark from './(assets)/dark/mongo-db.svg';*/
	/*const mongoDbImage = $derived(isDark ? MongoDBDark : MongoDB);*/
	mainContentView = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
			Layout_Stack($$anchor, {
				direction: 'column',
				gap: 'xxl',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							gap: 'none',
							direction: 'column',
							alignItems: 'center',
							alignContent: 'center',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
									Typography_Title($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create your first database');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_3 = $.sibling(node_2, 2);

								$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										variant: 'l-400',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Store, organize, and manage your app data');

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

					var node_4 = $.sibling(node_1, 2);

					$.component(node_4, () => Layout.Grid, ($$anchor, Layout_Grid) => {
						Layout_Grid($$anchor, {
							columns: 3,
							columnsS: 2,
							columnsXS: 1,
							gap: 'xl',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_5 = $.first_child(fragment_3);

								databaseTypeCard(node_5, () => ({
									type: 'tablesdb',
									title: 'TablesDB',
									subtitle: 'Structure your data in rows and columns. Best for relational data and advanced querying.',
									image: $.get(tablesDbImage)
								}));

								var node_6 = $.sibling(node_5, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = root();
										var node_7 = $.first_child(fragment_4);

										databaseTypeCard(node_7, () => ({
											type: 'documentsdb',
											title: 'DocumentsDB',
											subtitle: 'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
											image: $.get(documentsDbImage)
										}));

										var node_8 = $.sibling(node_7, 2);

										databaseTypeCard(node_8, () => ({
											type: 'vectorsdb',
											title: 'VectorsDB',
											subtitle: 'Store data as vectors to find similar results. Best for semantic search and recommendations.',
											image: $.get(vectorsDbImage)
										}));

										$.append($$anchor, fragment_4);
									};

									var d = $.derived(() => flags.multiDb({ account: $user(), organization: $organization() }));

									$.if(node_6, ($$render) => {
										if ($.get(d)) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment);
	};

	const databaseTypeCard = ($$anchor, $$arg0) => {
		let type = () => ($$arg0?.()).type;
		let title = () => ($$arg0?.()).title;
		let subtitle = () => ($$arg0?.()).subtitle;
		let image = $.derived_safe_equal(() => $.fallback(($$arg0?.()).image, undefined));

		Card($$anchor, {
			isButton: true,
			radius: 's',
			padding: 'none',
			get disabled() {
				return $$props.disabled;
			},
			$$events: { click: () => $$props.onDatabaseTypeSelected?.(type()) },
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_9 = $.first_child(fragment_6);

				$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
					Layout_Stack_2($$anchor, {
						gap: 'none',
						direction: 'column',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_1();
							var img = $.first_child(fragment_7);
							var node_10 = $.sibling(img, 2);

							Divider(node_10, {});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
								Layout_Stack_3($$anchor, {
									gap: 'xxs',
									direction: 'column',
									justifyContent: 'space-between',
									style: 'padding: var(--gap-xl); flex: 1;',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_12 = $.first_child(fragment_8);

										$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
											Layout_Stack_4($$anchor, {
												direction: 'column',
												gap: 'xxs',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root();
													var node_13 = $.first_child(fragment_9);

													$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
														Layout_Stack_5($$anchor, {
															inline: true,
															direction: 'row',
															alignItems: 'center',
															justifyContent: 'space-between',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root();
																var node_14 = $.first_child(fragment_10);

																$.component(node_14, () => Typography.Title, ($$anchor, Typography_Title_1) => {
																	Typography_Title_1($$anchor, {
																		size: 's',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text();

																			$.template_effect(() => $.set_text(text_2, title()));
																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_15 = $.sibling(node_14, 2);

																Icon(node_15, {
																	size: 'm',
																	get icon() {
																		return IconArrowRight;
																	},
																	color: '--fgcolor-neutral-tertiary'
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_13, 2);

													$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_1) => {
														Typography_Text_1($$anchor, {
															variant: 'l-400',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, subtitle()));
																$.append($$anchor, text_3);
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
									},
									$$slots: { default: true }
								});
							});

							$.template_effect(() => $.set_attribute(img, 'src', $.get(image)));
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	};

	const isDark = $.derived(() => $app().themeInUse === 'dark');
	const tablesDbImage = $.derived(() => $.get(isDark) ? TablesDBDark : TablesDB);
	const documentsDbImage = $.derived(() => $.get(isDark) ? DocumentsDBDark : DocumentsDB);
	const vectorsDbImage = $.derived(() => $.get(isDark) ? VectorsDBDark : VectorsDB);
	var fragment_13 = $.comment();
	var node_17 = $.first_child(fragment_13);

	{
		var consequent_1 = ($$anchor) => {
			mainContentView($$anchor);
		};

		var alternate = ($$anchor) => {
			Card($$anchor, {
				padding: 'l',
				radius: 'l',
				children: ($$anchor, $$slotProps) => {
					mainContentView($$anchor);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_17, ($$render) => {
			if ($isSmallViewport()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_13);
	$.pop();
	$$cleanup();
}