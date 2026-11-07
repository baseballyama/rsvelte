import * as $ from 'svelte/internal/server';
import { Layout, Table, Skeleton } from '@appwrite.io/pink-svelte';

export default function SkeletonRepoList($$renderer, $$props) {
	const { count = 4 } = $$props;

	if (Table.Root) {
		$$renderer.push('<!--[-->');

		Table.Root($$renderer, {
			columns: 1,
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { root }) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(Array(count));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let _ = each_array[$$index];

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
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														children: ($$renderer) => {
															Skeleton($$renderer, { variant: 'circle', width: 24 });
															$$renderer.push(`<!----> `);

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 's',
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$renderer) => {
																		Skeleton($$renderer, { variant: 'line', width: 200, height: 20 });
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);
															Skeleton($$renderer, { variant: 'line', width: 76, height: 32 });
															$$renderer.push(`<!---->`);
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
					}

					$$renderer.push(`<!--]-->`);
				}
			}
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}