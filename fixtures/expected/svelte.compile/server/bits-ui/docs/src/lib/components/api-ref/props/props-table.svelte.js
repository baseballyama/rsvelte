import * as $ from 'svelte/internal/server';
import * as Table from "$lib/components/ui/table/index.js";
import Code from "$lib/components/markdown/code.svelte";
import PropsRequiredBadge from "./props-required-badge.svelte";
import PropsBindableBadge from "./props-bindable-badge.svelte";
import { parseMarkdown } from "$lib/utils/markdown.js";
import PropsTypeContent from "./props-type-content.svelte";
import PropsTypeContentMobile from "./props-type-content-mobile.svelte";

export default function Props_table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { props: _props } = $$props;

		const propData = $.derived(() => {
			if (!_props) return [];

			return Object.entries(_props).map(([name, prop]) => {
				return { name, ...prop };
			});
		});

		if (propData().length) {
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
														class: 'w-[90%] whitespace-nowrap pr-1 sm:w-[38%]',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Property`);
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
														class: 'hidden w-[22%] whitespace-nowrap pr-1 sm:table-cell',
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

									const each_array = $.ensure_array_like(propData());

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let p = each_array[i];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'flex items-center gap-1 pr-1 align-baseline',
															children: ($$renderer) => {
																Code($$renderer, {
																	class: 'text-foreground h-fit py-1.5 font-semibold sm:h-[27px] sm:py-0',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(p.name)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																if (p.required) {
																	$$renderer.push('<!--[0-->');
																	PropsRequiredBadge($$renderer, { class: 'hidden sm:block' });
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--> `);

																if (p.bindable) {
																	$$renderer.push('<!--[0-->');
																	PropsBindableBadge($$renderer, { class: 'hidden sm:block' });
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
															class: 'hidden pr-1 align-baseline sm:table-cell',
															children: ($$renderer) => {
																PropsTypeContent($$renderer, { prop: p });
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
																$$renderer.push(`<p class="text-sm leading-[1.5rem]">${$.html(parseMarkdown(p.description))}</p> <div class="mt-2">`);

																Code($$renderer, {
																	class: 'bg-background h-auto px-0',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Default: `);

																		if (p.default) {
																			$$renderer.push(`<!--[0-->${$.escape(` ${p.default.value}`)}`);
																		} else {
																			$$renderer.push(`<!--[-1--><span aria-hidden="true"> ——</span> <span class="sr-only">undefined</span>`);
																		}

																		$$renderer.push(`<!--]-->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div>`);
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
																PropsTypeContentMobile($$renderer, { prop: p });
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