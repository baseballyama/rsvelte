import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Add from '$lib/components/ui/add';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="mt-6"><!></div>`);

export default function Add_1($$anchor, $$props) {
	$.push($$props, true);

	let withoutRegistry = $.prop($$props, 'withoutRegistry', 3, false);
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Add.Root, ($$anchor, Add_Root) => {
		Add_Root($$anchor, {
			get item() {
				return $$props.item;
			},

			get withoutRegistry() {
				return withoutRegistry();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Add.Group, ($$anchor, Add_Group) => {
					Add_Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Add.Button, ($$anchor, Add_Button) => {
								Add_Button($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Add.GroupSeparator, ($$anchor, Add_GroupSeparator) => {
								Add_GroupSeparator($$anchor, {});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Add.Dropdown, ($$anchor, Add_Dropdown) => {
								Add_Dropdown($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => Add.DropdownContent, ($$anchor, Add_DropdownContent) => {
											Add_DropdownContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_6 = $.first_child(fragment_3);

													$.each(node_6, 16, () => Add.INSTALLERS, (installer) => installer, ($$anchor, installer) => {
														var fragment_4 = $.comment();
														var node_7 = $.first_child(fragment_4);

														$.component(node_7, () => Add.DropdownInstallerOption, ($$anchor, Add_DropdownInstallerOption) => {
															Add_DropdownInstallerOption($$anchor, {
																get installer() {
																	return installer;
																}
															});
														});

														$.append($$anchor, fragment_4);
													});

													var node_8 = $.sibling(node_6, 2);

													$.component(node_8, () => Add.DropdownSeparator, ($$anchor, Add_DropdownSeparator) => {
														Add_DropdownSeparator($$anchor, {});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Add.DropdownCopyInit, ($$anchor, Add_DropdownCopyInit) => {
														Add_DropdownCopyInit($$anchor, {});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Add.DropdownSeparator, ($$anchor, Add_DropdownSeparator_1) => {
														Add_DropdownSeparator_1($$anchor, {});
													});

													var node_11 = $.sibling(node_10, 2);

													$.each(node_11, 16, () => Add.AGENTS, (agent) => agent, ($$anchor, agent) => {
														var fragment_5 = $.comment();
														var node_12 = $.first_child(fragment_5);

														$.component(node_12, () => Add.DropdownAgentOption, ($$anchor, Add_DropdownAgentOption) => {
															Add_DropdownAgentOption($$anchor, {
																get agent() {
																	return agent;
																}
															});
														});

														$.append($$anchor, fragment_5);
													});

													var node_13 = $.sibling(node_11, 2);

													$.component(node_13, () => Add.DropdownSeparator, ($$anchor, Add_DropdownSeparator_2) => {
														Add_DropdownSeparator_2($$anchor, {});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => Add.DropdownDocsLink, ($$anchor, Add_DropdownDocsLink) => {
														Add_DropdownDocsLink($$anchor, {});
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}