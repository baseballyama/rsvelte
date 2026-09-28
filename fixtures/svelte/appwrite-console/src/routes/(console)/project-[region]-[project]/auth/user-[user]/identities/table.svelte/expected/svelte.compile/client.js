import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Id, MultiSelectionTable } from '$lib/components';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { oAuthProviders } from '$lib/stores/oauth-providers';
import { app } from '$lib/stores/app';
import { base } from '$app/paths';
import { Table } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';

var root_1 = $.from_html(`<div class="avatar is-size-small"><img style="--p-text-size: 1rem" height="20" width="20"/></div>`);
var root_2 = $.from_html(`<div class="u-inline-flex u-cross-center u-gap-8"><!> </div>`);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function handleDelete(batchDelete) {
		const result = await batchDelete((id) => sdk.forProject(page.params.region, page.params.project).users.deleteIdentity({ identityId: id }));

		try {
			if (result.error) {
				trackError(result.error, Submit.UserIdentityDelete);
			} else {
				trackEvent(Submit.UserIdentityDelete, { total: result.deleted.length });
			}
		} finally {
			await invalidate(Dependencies.USER_IDENTITIES);
		}

		return result;
	}

	function getProviderMeta(providerId) {
		const provider = oAuthProviders[providerId];

		return { icon: provider?.icon, name: provider?.name ?? providerId };
	}

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => $$props.columns, $.index, ($$anchor, $$item) => {
				let id = () => $.get($$item).id;
				let title = () => $.get($$item).title;
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
					Table_Header_Cell($$anchor, {
						get column() {
							return id();
						},

						get root() {
							return root();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, title()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const children = ($$anchor, root = $.noop) => {
			var fragment_4 = $.comment();
			var node_2 = $.first_child(fragment_4);

			$.each(node_2, 17, () => $$props.data.identities.identities, (identity) => identity.$id, ($$anchor, identity) => {
				var fragment_5 = $.comment();
				var node_3 = $.first_child(fragment_5);

				$.component(node_3, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
					Table_Row_Base($$anchor, {
						get root() {
							return root();
						},

						get id() {
							return $.get(identity).$id;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_4 = $.first_child(fragment_6);

							$.each(node_4, 17, () => $$props.columns, $.index, ($$anchor, column) => {
								var fragment_7 = $.comment();
								var node_5 = $.first_child(fragment_7);

								$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
									Table_Cell($$anchor, {
										get column() {
											return $.get(column).id;
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_6 = $.first_child(fragment_8);

											{
												var consequent = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													$.key(node_7, () => $$props.columns, ($$anchor) => {
														Id($$anchor, {
															get value() {
																return $.get(identity)[$.get(column).id];
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text();

																$.template_effect(() => $.set_text(text_1, $.get(identity)[$.get(column).id]));
																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												};

												var consequent_2 = ($$anchor) => {
													const provider = $.derived(() => getProviderMeta($.get(identity)[$.get(column).id]));
													var div = root_2();
													var node_8 = $.child(div);

													{
														var consequent_1 = ($$anchor) => {
															var div_1 = root_1();
															var img = $.only_child(div_1);

															$.template_effect(() => {
																$.set_attribute(img, 'src', `${base}/icons/${$app().themeInUse}/color/${$.get(provider).icon}.svg`);
																$.set_attribute(img, 'alt', $.get(provider).name);
															});

															$.append($$anchor, div_1);
														};

														$.if(node_8, ($$render) => {
															if ($.get(provider).icon) $$render(consequent_1);
														});
													}

													var text_2 = $.sibling(node_8);

													$.reset(div);
													$.template_effect(() => $.set_text(text_2, ` ${$.get(provider).name ?? ''}`));
													$.append($$anchor, div);
												};

												var consequent_4 = ($$anchor) => {
													var fragment_12 = $.comment();
													var node_9 = $.first_child(fragment_12);

													{
														var consequent_3 = ($$anchor) => {
															var text_3 = $.text('-');

															$.append($$anchor, text_3);
														};

														var alternate = ($$anchor) => {
															DualTimeView($$anchor, {
																get time() {
																	return $.get(identity)[$.get(column).id];
																}
															});
														};

														$.if(node_9, ($$render) => {
															if (!$.get(identity)[$.get(column).id]) $$render(consequent_3); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_12);
												};

												var alternate_1 = ($$anchor) => {
													var text_4 = $.text();

													$.template_effect(() => $.set_text(text_4, $.get(identity)[$.get(column).id]));
													$.append($$anchor, text_4);
												};

												$.if(node_6, ($$render) => {
													if ($.get(column).id === '$id') $$render(consequent); else if ($.get(column).id === 'provider') $$render(consequent_2, 1); else if ($.get(column).type === 'datetime') $$render(consequent_4, 2); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable($$anchor, {
			get columns() {
				return $$props.columns;
			},
			resource: 'identity',
			onDelete: handleDelete,
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	$.pop();
	$$cleanup();
}