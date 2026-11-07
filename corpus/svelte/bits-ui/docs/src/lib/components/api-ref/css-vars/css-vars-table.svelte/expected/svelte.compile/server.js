import * as $ from 'svelte/internal/server';
import Code from "$lib/components/markdown/code.svelte";
import * as Table from "$lib/components/ui/table/index.js";
import { parseMarkdown } from "$lib/utils/index.js";
import CssVarsDetailsMobile from "./css-vars-details-mobile.svelte";

export default function Css_vars_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { cssVars = [] } = $$props;

		if (cssVars.length) {
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
											class: 'w-1/4',
											children: ($$renderer) => {
												if (Table.Head) {
													$$renderer.push('<!--[-->');

													Table.Head($$renderer, {
														class: 'w-[90%] whitespace-nowrap sm:w-[60%]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->CSS Variable`);
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
														class: 'sr-only w-[10%] sm:hidden',
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

									const each_array = $.ensure_array_like(cssVars);

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
																		$$renderer.push(`<!---->${$.escape(attr.name)}`);
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
															class: 'hidden align-baseline sm:table-cell',
															children: ($$renderer) => {
																if (attr.description) {
																	$$renderer.push(`<!--[0--><p class="my-2 text-sm leading-7">${$.html(parseMarkdown(attr.description))}</p>`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'overflow-hidden py-0 sm:hidden',
															children: ($$renderer) => {
																CssVarsDetailsMobile($$renderer, { cssVar: attr });
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