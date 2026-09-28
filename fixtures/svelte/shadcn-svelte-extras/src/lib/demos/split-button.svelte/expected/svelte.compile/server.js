import * as $ from 'svelte/internal/server';
import * as SplitButton from '$lib/components/ui/split-button';

export default function Split_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function sleep(ms) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		if (SplitButton.Root) {
			$$renderer.push('<!--[-->');

			SplitButton.Root($$renderer, {
				onClickPromise: async () => {
					await sleep(1000);
				},

				children: ($$renderer) => {
					if (SplitButton.Action) {
						$$renderer.push('<!--[-->');

						SplitButton.Action($$renderer, {
							value: 'merge',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Merge changes`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (SplitButton.Action) {
						$$renderer.push('<!--[-->');

						SplitButton.Action($$renderer, {
							value: 'squash',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Squash and merge`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (SplitButton.Action) {
						$$renderer.push('<!--[-->');

						SplitButton.Action($$renderer, {
							value: 'rebase',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Rebase and merge`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (SplitButton.Select) {
						$$renderer.push('<!--[-->');

						SplitButton.Select($$renderer, {
							children: ($$renderer) => {
								if (SplitButton.SelectTrigger) {
									$$renderer.push('<!--[-->');
									SplitButton.SelectTrigger($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (SplitButton.SelectContent) {
									$$renderer.push('<!--[-->');

									SplitButton.SelectContent($$renderer, {
										class: 'max-w-64',
										children: ($$renderer) => {
											if (SplitButton.SelectGroup) {
												$$renderer.push('<!--[-->');

												SplitButton.SelectGroup($$renderer, {
													children: ($$renderer) => {
														if (SplitButton.SelectAction) {
															$$renderer.push('<!--[-->');

															SplitButton.SelectAction($$renderer, {
																value: 'merge',
																class: 'flex flex-col gap-0.5',
																children: ($$renderer) => {
																	$$renderer.push(`<span>Create a merge commit</span> <span class="text-muted-foreground text-xs">All commits from this branch will be added to the base branch via a merge commit.</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (SplitButton.SelectAction) {
															$$renderer.push('<!--[-->');

															SplitButton.SelectAction($$renderer, {
																value: 'squash',
																class: 'flex flex-col gap-0.5',
																children: ($$renderer) => {
																	$$renderer.push(`<span>Squash and merge</span> <span class="text-muted-foreground text-xs">The 2 commits from this branch will be combined into one commit in the base branch.</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (SplitButton.SelectAction) {
															$$renderer.push('<!--[-->');

															SplitButton.SelectAction($$renderer, {
																value: 'rebase',
																class: 'flex flex-col gap-0.5',
																children: ($$renderer) => {
																	$$renderer.push(`<span>Rebase this branch onto the base branch</span> <span class="text-muted-foreground text-xs">The 2 commits from this branch will be rebased and added to the base branch.</span>`);
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
	});
}