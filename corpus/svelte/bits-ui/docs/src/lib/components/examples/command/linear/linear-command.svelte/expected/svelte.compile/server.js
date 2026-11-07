import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

import {
	AssignToIcon,
	AssignToMeIcon,
	ChangeLabelsIcon,
	ChangePriorityIcon,
	ChangeStatusIcon,
	RemoveLabelIcon,
	SetDueDateIcon
} from "./icons/index.js";

import "./linear.css";

export default function Linear_command($$renderer) {
	const items = [
		{ icon: AssignToIcon, label: "Assign to...", shortcut: ["A"] },
		{ icon: AssignToMeIcon, label: "Assign to me", shortcut: ["I"] },
		{
			icon: ChangeStatusIcon,
			label: "Change status...",
			shortcut: ["S"]
		},

		{
			icon: ChangePriorityIcon,
			label: "Change priority...",
			shortcut: ["P"]
		},

		{
			icon: ChangeLabelsIcon,
			label: "Change labels...",
			shortcut: ["L"]
		},

		{
			icon: RemoveLabelIcon,
			label: "Remove label...",
			shortcut: ["⇧", "L"]
		},

		{
			icon: SetDueDateIcon,
			label: "Set due date...",
			shortcut: ["⇧", "D"]
		}
	];

	$$renderer.push(`<div class="linear">`);

	if (Command.Root) {
		$$renderer.push('<!--[-->');

		Command.Root($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div data-command-linear-badge="">Issue - FUN-343</div> `);

				if (Command.Input) {
					$$renderer.push('<!--[-->');
					Command.Input($$renderer, { autofocus: true, placeholder: 'Type a command or search...' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Command.List) {
					$$renderer.push('<!--[-->');

					Command.List($$renderer, {
						children: ($$renderer) => {
							if (Command.Viewport) {
								$$renderer.push('<!--[-->');

								Command.Viewport($$renderer, {
									children: ($$renderer) => {
										if (Command.Empty) {
											$$renderer.push('<!--[-->');

											Command.Empty($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->No results found.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <!--[-->`);

										const each_array = $.ensure_array_like(items);

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let { label, shortcut, icon } = each_array[$$index_1];
											const Icon = icon;

											if (Command.Item) {
												$$renderer.push('<!--[-->');

												Command.Item($$renderer, {
													value: label,
													children: ($$renderer) => {
														if (Icon) {
															$$renderer.push('<!--[-->');
															Icon($$renderer, {});
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` ${$.escape(label)} <div data-command-linear-shortcuts=""><!--[-->`);

														const each_array_1 = $.ensure_array_like(shortcut);

														for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
															let key = each_array_1[$$index];

															$$renderer.push(`<kbd>${$.escape(key)}</kbd>`);
														}

														$$renderer.push(`<!--]--></div>`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}