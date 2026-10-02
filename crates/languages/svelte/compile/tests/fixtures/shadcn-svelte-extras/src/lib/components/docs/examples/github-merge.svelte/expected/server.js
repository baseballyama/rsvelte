import * as $ from 'svelte/internal/server';
import * as SplitButton from '$lib/components/ui/split-button';
import { Separator } from '$lib/components/ui/separator';
import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
import CircleDashedIcon from '@lucide/svelte/icons/circle-dashed';

export default function Github_merge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let primary = 'squash';
		let update = 'merge';

		function sleep(ms) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="bg-card text-card-foreground relative flex flex-col overflow-hidden rounded-lg border shadow-xs"><div class="flex items-start gap-3 p-4">`);
			CircleDashedIcon($$renderer, { class: 'mt-0.5 size-5 shrink-0 text-green-500' });
			$$renderer.push(`<!----> <div class="flex-1"><h3 class="text-sm font-semibold">All checks have passed</h3> <p class="text-muted-foreground text-xs">1 skipped, 6 successful checks</p></div></div> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <div class="flex items-start gap-3 p-4">`);

			CircleCheckIcon($$renderer, {
				class: 'mt-0.5 size-5 shrink-0 fill-green-500/15 text-green-500'
			});

			$$renderer.push(`<!----> <div class="flex-1"><h3 class="text-sm font-semibold">No conflicts with base branch</h3> <p class="text-muted-foreground text-xs">It's <span class="text-foreground underline underline-offset-2">12 commits</span> behind (base commit: <code class="text-xs">28c320c</code>)</p></div> `);

			if (SplitButton.Root) {
				$$renderer.push('<!--[-->');

				SplitButton.Root($$renderer, {
					onClickPromise: async () => {
						await sleep(1000);
					},

					get value() {
						return update;
					},

					set value($$value) {
						update = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (SplitButton.Action) {
							$$renderer.push('<!--[-->');

							SplitButton.Action($$renderer, {
								value: 'merge',
								size: 'sm',
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update branch`);
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
								size: 'sm',
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Rebase branch`);
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
										SplitButton.SelectTrigger($$renderer, { size: 'sm', variant: 'outline' });
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
																		$$renderer.push(`<span class="font-medium">Update with merge commit</span> <span class="text-muted-foreground text-xs">The merge commit will be associated with your account.</span>`);
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
																		$$renderer.push(`<span class="font-medium">Update with rebase</span> <span class="text-muted-foreground text-xs">This pull request will be rebased on top of the latest changes and then force
								pushed.</span>`);
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

			$$renderer.push(`</div> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <div class="flex flex-wrap items-center gap-3 p-4">`);

			if (SplitButton.Root) {
				$$renderer.push('<!--[-->');

				SplitButton.Root($$renderer, {
					onClickPromise: async () => {
						await sleep(1000);
					},

					get value() {
						return primary;
					},

					set value($$value) {
						primary = $$value;
						$$settled = false;
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
											class: 'max-w-72',
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
																		$$renderer.push(`<span class="font-medium">Create a merge commit</span> <span class="text-muted-foreground text-xs">All commits from this branch will be added to the base branch via a merge commit.</span>`);
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
																		$$renderer.push(`<span class="font-medium">Squash and merge</span> <span class="text-muted-foreground text-xs">The 1 commit from this branch will be added to the base branch.</span>`);
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
																		$$renderer.push(`<span class="font-medium">Rebase and merge</span> <span class="text-muted-foreground text-xs">The 1 commit from this branch will be rebased and added to the base branch.</span>`);
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

			$$renderer.push(` <p class="text-muted-foreground flex-1 text-xs">You can also merge this with the command line. <a href="#/" class="text-foreground underline underline-offset-2">View command line instructions.</a></p></div> <div class="text-muted-foreground flex justify-end px-4 pb-3 text-xs">Still in progress? <a href="#/" class="underline underline-offset-2">Convert to draft</a></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}