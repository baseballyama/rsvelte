import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as SplitButton from '$lib/components/ui/split-button';

var root = $.from_html(`<span>Create a merge commit</span> <span class="text-muted-foreground text-xs">All commits from this branch will be added to the base branch via a merge commit.</span>`, 1);
var root_1 = $.from_html(`<span>Squash and merge</span> <span class="text-muted-foreground text-xs">The 2 commits from this branch will be combined into one commit in the base branch.</span>`, 1);
var root_2 = $.from_html(`<span>Rebase this branch onto the base branch</span> <span class="text-muted-foreground text-xs">The 2 commits from this branch will be rebased and added to the base branch.</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Split_button($$anchor, $$props) {
	$.push($$props, true);

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SplitButton.Root, ($$anchor, SplitButton_Root) => {
		SplitButton_Root($$anchor, {
			onClickPromise: async () => {
				await sleep(1000);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => SplitButton.Action, ($$anchor, SplitButton_Action) => {
					SplitButton_Action($$anchor, {
						value: 'merge',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Merge changes');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => SplitButton.Action, ($$anchor, SplitButton_Action_1) => {
					SplitButton_Action_1($$anchor, {
						value: 'squash',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Squash and merge');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => SplitButton.Action, ($$anchor, SplitButton_Action_2) => {
					SplitButton_Action_2($$anchor, {
						value: 'rebase',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Rebase and merge');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => SplitButton.Select, ($$anchor, SplitButton_Select) => {
					SplitButton_Select($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_4();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => SplitButton.SelectTrigger, ($$anchor, SplitButton_SelectTrigger) => {
								SplitButton_SelectTrigger($$anchor, {});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => SplitButton.SelectContent, ($$anchor, SplitButton_SelectContent) => {
								SplitButton_SelectContent($$anchor, {
									class: 'max-w-64',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_7 = $.first_child(fragment_3);

										$.component(node_7, () => SplitButton.SelectGroup, ($$anchor, SplitButton_SelectGroup) => {
											SplitButton_SelectGroup($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_3();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction) => {
														SplitButton_SelectAction($$anchor, {
															value: 'merge',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();

																$.next(2);
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_1) => {
														SplitButton_SelectAction_1($$anchor, {
															value: 'squash',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();

																$.next(2);
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => SplitButton.SelectAction, ($$anchor, SplitButton_SelectAction_2) => {
														SplitButton_SelectAction_2($$anchor, {
															value: 'rebase',
															class: 'flex flex-col gap-0.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_2();

																$.next(2);
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
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
	$.pop();
}