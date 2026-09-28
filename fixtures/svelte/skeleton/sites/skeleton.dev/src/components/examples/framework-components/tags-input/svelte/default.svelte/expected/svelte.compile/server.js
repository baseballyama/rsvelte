import * as $ from 'svelte/internal/server';
import { TagsInput } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		TagsInput($$renderer, {
			defaultValue: ['Vanilla', 'Chocolate', 'Strawberry'],
			children: ($$renderer) => {
				if (TagsInput.Label) {
					$$renderer.push('<!--[-->');

					TagsInput.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flavors`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

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

				if (TagsInput.ClearTrigger) {
					$$renderer.push('<!--[-->');

					TagsInput.ClearTrigger($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Clear All`);
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
	});
}