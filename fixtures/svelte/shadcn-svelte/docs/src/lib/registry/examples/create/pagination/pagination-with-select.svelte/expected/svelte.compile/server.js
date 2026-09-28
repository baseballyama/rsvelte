import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Pagination from "$lib/registry/ui/pagination/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Pagination_with_select($$renderer) {
	let selectedValue = "25";
	const selectedLabel = $.derived(() => selectedValue);
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Select',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-between gap-4">`);

				if (Field.Field) {
					$$renderer.push('<!--[-->');

					Field.Field($$renderer, {
						orientation: 'horizontal',
						class: 'w-fit',
						children: ($$renderer) => {
							if (Field.Label) {
								$$renderer.push('<!--[-->');

								Field.Label($$renderer, {
									for: 'select-rows-per-page',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Rows per page`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Select.Root) {
								$$renderer.push('<!--[-->');

								Select.Root($$renderer, {
									type: 'single',
									get value() {
										return selectedValue;
									},

									set value($$value) {
										selectedValue = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Select.Trigger) {
											$$renderer.push('<!--[-->');

											Select.Trigger($$renderer, {
												class: 'w-20',
												id: 'select-rows-per-page',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(selectedLabel())}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Content) {
											$$renderer.push('<!--[-->');

											Select.Content($$renderer, {
												align: 'start',
												children: ($$renderer) => {
													if (Select.Group) {
														$$renderer.push('<!--[-->');

														Select.Group($$renderer, {
															children: ($$renderer) => {
																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '10',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->10`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '25',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->25`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '50',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->50`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: '100',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->100`);
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

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Pagination.Root) {
					$$renderer.push('<!--[-->');

					Pagination.Root($$renderer, {
						page: 2,
						count: 100,
						class: 'mx-0 w-auto',
						children: ($$renderer) => {
							if (Pagination.Content) {
								$$renderer.push('<!--[-->');

								Pagination.Content($$renderer, {
									children: ($$renderer) => {
										if (Pagination.Item) {
											$$renderer.push('<!--[-->');

											Pagination.Item($$renderer, {
												children: ($$renderer) => {
													if (Pagination.PrevButton) {
														$$renderer.push('<!--[-->');
														Pagination.PrevButton($$renderer, {});
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

										if (Pagination.Item) {
											$$renderer.push('<!--[-->');

											Pagination.Item($$renderer, {
												children: ($$renderer) => {
													if (Pagination.NextButton) {
														$$renderer.push('<!--[-->');
														Pagination.NextButton($$renderer, {});
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

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}