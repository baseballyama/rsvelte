import * as $ from 'svelte/internal/server';
import Code from "$lib/components/markdown/code.svelte";
import * as Table from "$lib/components/ui/table/index.js";
import { parseMarkdown } from "$lib/utils/index.js";
import DataAttrsValueContentMobile from "./data-attrs-value-content-mobile.svelte";
import DataAttrValueContent from "./data-attrs-value-content.svelte";

export default function Data_attrs_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dataAttrs = [] } = $$props;

		if (dataAttrs.length) {
			$$renderer.push('<!--[0-->');

			if (Table.Root) {
				$$renderer.push('<!--[-->');

				Table.Root($$renderer, {
					children: ($$renderer) => {
						if (Table.Header) {
							$$renderer.push('<!--[-->');

							Table.Header($$renderer, {
								children: ($$renderer) => {
									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'w-[90%] whitespace-nowrap sm:w-[38%]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Data Attribute`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'hidden w-[22%] whitespace-nowrap sm:table-cell',
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

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'hidden w-[40%] whitespace-nowrap sm:table-cell',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Description`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'sr-only w-[10%] whitespace-nowrap sm:hidden',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Details`);
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

						$$renderer.push(` `);

						if (Table.Body) {
							$$renderer.push('<!--[-->');

							Table.Body($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(dataAttrs);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let attr = each_array[$$index];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'align-baseline',
															children: ($$renderer) => {
																Code($$renderer, {
																	class: 'text-foreground h-fit py-1.5 font-semibold md:py-1 lg:h-[27px] lg:py-0',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->data-${$.escape(attr.name)}`);
																	},
																	$$slots: { default: true }
																});
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
															class: 'hidden pr-1 align-baseline sm:table-cell',
															children: ($$renderer) => {
																DataAttrValueContent($$renderer, { attr });
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
															class: 'hidden align-baseline sm:table-cell',
															children: ($$renderer) => {
																$$renderer.push(`<p class="text-sm leading-[1.5rem]">${$.html(parseMarkdown(attr.description))}</p>`);
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
															class: 'overflow-hidden py-0 sm:hidden',
															children: ($$renderer) => {
																DataAttrsValueContentMobile($$renderer, { attr });
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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}