import * as $ from 'svelte/internal/server';
import { TagsInput, useTagsInput } from '@skeletonlabs/skeleton-svelte';

export default function Provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const tagsInput = useTagsInput({ id, defaultValue: ['Vanilla', 'Chocolate', 'Strawberry'] });

		$$renderer.push(`<div class="w-full space-y-4">`);

		if (TagsInput.Provider) {
			$$renderer.push('<!--[-->');

			TagsInput.Provider($$renderer, {
				value: tagsInput,
				children: ($$renderer) => {
					if (TagsInput.Control) {
						$$renderer.push('<!--[-->');

						TagsInput.Control($$renderer, {
							children: ($$renderer) => {
								{
									function children($$renderer, tagsInput) {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(tagsInput().value);

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let value = each_array[index];

											if (TagsInput.Item) {
												$$renderer.push('<!--[-->');

												TagsInput.Item($$renderer, {
													value,
													index,
													children: ($$renderer) => {
														if (TagsInput.ItemPreview) {
															$$renderer.push('<!--[-->');

															TagsInput.ItemPreview($$renderer, {
																children: ($$renderer) => {
																	if (TagsInput.ItemText) {
																		$$renderer.push('<!--[-->');

																		TagsInput.ItemText($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(value)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (TagsInput.ItemDeleteTrigger) {
																		$$renderer.push('<!--[-->');
																		TagsInput.ItemDeleteTrigger($$renderer, {});
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

														if (TagsInput.ItemInput) {
															$$renderer.push('<!--[-->');
															TagsInput.ItemInput($$renderer, {});
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

									if (TagsInput.Context) {
										$$renderer.push('<!--[-->');
										TagsInput.Context($$renderer, { children, $$slots: { default: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (TagsInput.Input) {
									$$renderer.push('<!--[-->');
									TagsInput.Input($$renderer, { placeholder: 'Add a flavor...' });
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

					if (TagsInput.HiddenInput) {
						$$renderer.push('<!--[-->');
						TagsInput.HiddenInput($$renderer, {});
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

		$$renderer.push(` <div class="card preset-outlined-surface-200-800 flex justify-center items-center py-4"><button class="btn preset-filled">Clear Tags</button></div></div>`);
	});
}