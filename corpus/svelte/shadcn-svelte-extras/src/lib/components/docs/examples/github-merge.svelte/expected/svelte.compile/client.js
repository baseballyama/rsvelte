import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as SplitButton from '$lib/components/ui/split-button';
import { Separator } from '$lib/components/ui/separator';
import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
import CircleDashedIcon from '@lucide/svelte/icons/circle-dashed';

var root = $.from_html(`<span class="font-medium">Update with merge commit</span> <span class="text-muted-foreground text-xs">The merge commit will be associated with your account.</span>`, 1);

var root_1 = $.from_html(
	`<span class="font-medium">Update with rebase</span> <span class="text-muted-foreground text-xs">This pull request will be rebased on top of the latest changes and then force
								pushed.</span>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<span class="font-medium">Create a merge commit</span> <span class="text-muted-foreground text-xs">All commits from this branch will be added to the base branch via a merge commit.</span>`, 1);
var root_5 = $.from_html(`<span class="font-medium">Squash and merge</span> <span class="text-muted-foreground text-xs">The 1 commit from this branch will be added to the base branch.</span>`, 1);
var root_6 = $.from_html(`<span class="font-medium">Rebase and merge</span> <span class="text-muted-foreground text-xs">The 1 commit from this branch will be rebased and added to the base branch.</span>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<div class="bg-card text-card-foreground relative flex flex-col overflow-hidden rounded-lg border shadow-xs"><div class="flex items-start gap-3 p-4"><!> <div class="flex-1"><h3 class="text-sm font-semibold">All checks have passed</h3> <p class="text-muted-foreground text-xs">1 skipped, 6 successful checks</p></div></div> <!> <div class="flex items-start gap-3 p-4"><!> <div class="flex-1"><h3 class="text-sm font-semibold">No conflicts with base branch</h3> <p class="text-muted-foreground text-xs">It's <span class="text-foreground underline underline-offset-2">12 commits</span> behind (base commit: <code class="text-xs">28c320c</code>)</p></div> <!></div> <!> <div class="flex flex-wrap items-center gap-3 p-4"><!> <p class="text-muted-foreground flex-1 text-xs">You can also merge this with the command line. <a href="#/" class="text-foreground underline underline-offset-2">View command line instructions.</a></p></div> <div class="text-muted-foreground flex justify-end px-4 pb-3 text-xs">Still in progress?&nbsp;<a href="#/" class="underline underline-offset-2">Convert to draft</a></div></div>`);

export default function Github_merge($$anchor, $$props) {
	$.push($$props, true);

	let primary = $.state('squash');
	let update = $.state('merge');

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	var div = root_8();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	CircleDashedIcon(node, { class: 'mt-0.5 size-5 shrink-0 text-green-500' });
	$.next(2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Separator(node_1, {});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	CircleCheckIcon(node_2, {
		class: 'mt-0.5 size-5 shrink-0 fill-green-500/15 text-green-500'
	});

	var node_3 = $.sibling(node_2, 4);

	$.component(node_3, () => SplitButton.Root, ($$anchor, SplitButton_Root) => {
		SplitButton_Root($$anchor, {
			onClickPromise: async () => {
				await sleep(1000);
			},

			get value() {
				return $.get(update);
			},

			set value($$value) {
				$.set(update, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_4 = $.first_child(fragment);

				$.component(node_4, () => SplitButton.Action, ($$anchor, SplitButton_Action) => {
					SplitButton_Action($$anchor, {
						value: 'merge',
						size: 'sm',
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Update branch');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => SplitButton.Action, ($$anchor, SplitButton_Action_1) => {
					SplitButton_Action_1($$anchor, {
						value: 'rebase',
						size: 'sm',
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Rebase branch');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => SplitButton.Select, ($$anchor, SplitButton_Select) => {
					SplitButton_Select($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_2();
							var node_7 = $.first_child(fragment_1);

							$.component(node_7, () => SplitButton.SelectTrigger, ($$anchor, SplitButton_SelectTrigger) => {
								SplitButton_SelectTrigger($$anchor, { size: 'sm', variant: 'outline' });
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => SplitButton.SelectContent, ($$anchor, SplitButton_SelectContent) => {
								SplitButton_SelectContent($$anchor, {
									class: 'max-w-64',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_9 = $.first_child(fragment_2);

										$.component(node_9, () => SplitButton.SelectGroup, ($$anchor, SplitButton_SelectGroup) => {
											SplitButton_SelectGroup($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_2();
													var node_10 = $.first_child(fragment_3);

													$.component(node_10, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction) => {
														SplitButton_SelectAction($$anchor, {
															value: 'merge',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root();

																$.next(2);
																$.append($$anchor, fragment_4);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_1) => {
														SplitButton_SelectAction_1($$anchor, {
															value: 'rebase',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_1();

																$.next(2);
																$.append($$anchor, fragment_5);
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
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var node_12 = $.sibling(div_2, 2);

	Separator(node_12, {});

	var div_3 = $.sibling(node_12, 2);
	var node_13 = $.child(div_3);

	$.component(node_13, () => SplitButton.Root, ($$anchor, SplitButton_Root_1) => {
		SplitButton_Root_1($$anchor, {
			onClickPromise: async () => {
				await sleep(1000);
			},

			get value() {
				return $.get(primary);
			},

			set value($$value) {
				$.set(primary, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_7();
				var node_14 = $.first_child(fragment_6);

				$.component(node_14, () => SplitButton.Action, ($$anchor, SplitButton_Action_2) => {
					SplitButton_Action_2($$anchor, {
						value: 'merge',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Merge changes');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_15 = $.sibling(node_14, 2);

				$.component(node_15, () => SplitButton.Action, ($$anchor, SplitButton_Action_3) => {
					SplitButton_Action_3($$anchor, {
						value: 'squash',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Squash and merge');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_15, 2);

				$.component(node_16, () => SplitButton.Action, ($$anchor, SplitButton_Action_4) => {
					SplitButton_Action_4($$anchor, {
						value: 'rebase',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Rebase and merge');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => SplitButton.Select, ($$anchor, SplitButton_Select_1) => {
					SplitButton_Select_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_2();
							var node_18 = $.first_child(fragment_7);

							$.component(node_18, () => SplitButton.SelectTrigger, ($$anchor, SplitButton_SelectTrigger_1) => {
								SplitButton_SelectTrigger_1($$anchor, {});
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => SplitButton.SelectContent, ($$anchor, SplitButton_SelectContent_1) => {
								SplitButton_SelectContent_1($$anchor, {
									class: 'max-w-72',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_20 = $.first_child(fragment_8);

										$.component(node_20, () => SplitButton.SelectGroup, ($$anchor, SplitButton_SelectGroup_1) => {
											SplitButton_SelectGroup_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_3();
													var node_21 = $.first_child(fragment_9);

													$.component(node_21, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_2) => {
														SplitButton_SelectAction_2($$anchor, {
															value: 'merge',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_4();

																$.next(2);
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													$.component(node_22, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_3) => {
														SplitButton_SelectAction_3($$anchor, {
															value: 'squash',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_5();

																$.next(2);
																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_4) => {
														SplitButton_SelectAction_4($$anchor, {
															value: 'rebase',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root_6();

																$.next(2);
																$.append($$anchor, fragment_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_3);
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}