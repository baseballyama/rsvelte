import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<kbd> </kbd>`);
var root_1 = $.from_html(`<!> <div data-command-linear-shortcuts=""></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div data-command-linear-badge="">Issue - FUN-343</div> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="linear"><!></div>`);

export default function Linear_command($$anchor) {
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

	var div = root_4();
	var node = $.child(div);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_1 = $.sibling($.first_child(fragment), 2);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { autofocus: true, placeholder: 'Type a command or search...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_2();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('No results found.');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.each(node_5, 17, () => items, ({ label, shortcut, icon }) => label + shortcut, ($$anchor, $$item) => {
											let label = () => $.get($$item).label;
											let shortcut = () => $.get($$item).shortcut;
											let icon = () => $.get($$item).icon;
											const Icon = $.derived(icon);
											var fragment_3 = $.comment();
											var node_6 = $.first_child(fragment_3);

											$.component(node_6, () => Command.Item, ($$anchor, Command_Item) => {
												Command_Item($$anchor, {
													get value() {
														return label();
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_1();
														var node_7 = $.first_child(fragment_4);

														$.component(node_7, () => $.get(Icon), ($$anchor, Icon_1) => {
															Icon_1($$anchor, {});
														});

														var text_1 = $.sibling(node_7);
														var div_1 = $.sibling(text_1);

														$.each(div_1, 20, shortcut, (key) => key, ($$anchor, key) => {
															var kbd = root();
															var text_2 = $.only_child(kbd, true);

															$.template_effect(() => $.set_text(text_2, key));
															$.append($$anchor, kbd);
														});

														$.reset(div_1);
														$.template_effect(() => $.set_text(text_1, ` ${label() ?? ''} `));
														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
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

	$.reset(div);
	$.append($$anchor, div);
}