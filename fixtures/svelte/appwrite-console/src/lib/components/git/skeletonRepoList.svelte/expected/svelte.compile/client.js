import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout, Table, Skeleton } from '@appwrite.io/pink-svelte';

var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function SkeletonRepoList($$anchor, $$props) {
	const count = $.prop($$props, 'count', 3, 4);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			columns: 1,
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const root = $.derived(() => $$slotProps.root);
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, () => Array(count()), $.index, ($$anchor, _) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
							Table_Row_Base($$anchor, {
								get root() {
									return $.get(root);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Table.Cell, ($$anchor, Table_Cell) => {
										Table_Cell($$anchor, {
											get root() {
												return $.get(root);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
													Layout_Stack($$anchor, {
														direction: 'row',
														alignItems: 'center',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_1();
															var node_5 = $.first_child(fragment_5);

															Skeleton(node_5, { variant: 'circle', width: 24 });

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																Layout_Stack_1($$anchor, {
																	gap: 's',
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		Skeleton($$anchor, { variant: 'line', width: 200, height: 20 });
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															Skeleton(node_7, { variant: 'line', width: 76, height: 32 });
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					});

					$.append($$anchor, fragment_1);
				}
			}
		});
	});

	$.append($$anchor, fragment);
}