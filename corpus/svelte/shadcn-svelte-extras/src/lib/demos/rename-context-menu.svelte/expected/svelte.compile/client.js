import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Rename from '$lib/components/ui/rename';
import * as ContextMenu from '$lib/components/ui/context-menu';
import FileIcon from '@lucide/svelte/icons/file';
import * as Icons from '$lib/components/icons';
import { Kbd } from '$lib/components/ui/kbd';

var root = $.from_html(`<button type="button" class="focus:bg-accent hover:bg-accent text-muted-foreground flex cursor-pointer items-center gap-2 px-2 text-start outline-none"><!> <!></button>`);
var root_1 = $.from_html(`Rename... <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-4"><p class="text-muted-foreground text-sm">Right click or press <!> to rename files.</p> <div class="flex flex-col"></div></div>`);

export default function Rename_context_menu($$anchor) {
	let documents = $.proxy([
		{ name: '+layout.svelte', mode: 'view' },
		{ name: '+page.svelte', mode: 'view' },
		{ name: '+page.server.ts', mode: 'view' }
	]);

	function checkUnique(name, index) {
		return !documents.some((document, i) => i !== index && document.name === name);
	}

	function validateName(name, index) {
		if (name.trim() === '') return false;

		return checkUnique(name, index);
	}

	var div = root_4();
	var p = $.child(div);
	var node = $.sibling($.child(p));

	Kbd(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('F2');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p);

	var div_1 = $.sibling(p, 2);

	$.each(div_1, 23, () => documents, (document) => document.name, ($$anchor, document, index) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		$.component(node_1, () => Rename.Provider, ($$anchor, Rename_Provider) => {
			Rename_Provider($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => ContextMenu.Root, ($$anchor, ContextMenu_Root) => {
						ContextMenu_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_3();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => ContextMenu.Trigger, ($$anchor, ContextMenu_Trigger) => {
									ContextMenu_Trigger($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var button = root();
											var node_4 = $.child(button);

											{
												var consequent = ($$anchor) => {
													var fragment_3 = $.comment();
													var node_5 = $.first_child(fragment_3);

													$.component(node_5, () => Icons.CSS, ($$anchor, Icons_CSS) => {
														Icons_CSS($$anchor, { class: 'size-4' });
													});

													$.append($$anchor, fragment_3);
												};

												var d = $.derived(() => $.get(document).name.endsWith('.css'));

												var consequent_1 = ($$anchor) => {
													var fragment_4 = $.comment();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => Icons.Svelte, ($$anchor, Icons_Svelte) => {
														Icons_Svelte($$anchor, { class: 'size-4' });
													});

													$.append($$anchor, fragment_4);
												};

												var d_1 = $.derived(() => $.get(document).name.endsWith('.svelte'));

												var consequent_2 = ($$anchor) => {
													var fragment_5 = $.comment();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Icons.TypeScript, ($$anchor, Icons_TypeScript) => {
														Icons_TypeScript($$anchor, { class: 'size-3' });
													});

													$.append($$anchor, fragment_5);
												};

												var d_2 = $.derived(() => $.get(document).name.endsWith('.ts'));

												var alternate = ($$anchor) => {
													FileIcon($$anchor, { class: 'size-4' });
												};

												$.if(node_4, ($$render) => {
													if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1); else if ($.get(d_2)) $$render(consequent_2, 2); else $$render(alternate, -1);
												});
											}

											var node_8 = $.sibling(node_4, 2);

											$.component(node_8, () => Rename.Root, ($$anchor, Rename_Root) => {
												Rename_Root($$anchor, {
													this: 'span',
													blurBehavior: 'exit',
													class: 'text-foreground outline-ring flex h-7 w-[200px] !rounded-xs text-start focus:!ring-0 focus:outline-1 data-[mode=view]:place-items-center',
													validate: (name) => validateName(name, $.get(index)),
													fallbackSelectionBehavior: 'all',
													get value() {
														return $.get(document).name;
													},

													set value($$value) {
														($.get(document).name = $$value);
													},

													get mode() {
														return $.get(document).mode;
													},

													set mode($$value) {
														($.get(document).mode = $$value);
													}
												});
											});

											$.reset(button);

											$.delegated('keydown', button, (e) => {
												if (e.key === 'F2') {
													($.get(document).mode = 'edit');
												}
											});

											$.append($$anchor, button);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_3, 2);

								$.component(node_9, () => ContextMenu.Content, ($$anchor, ContextMenu_Content) => {
									ContextMenu_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();
											var node_10 = $.first_child(fragment_7);

											$.component(node_10, () => ContextMenu.Item, ($$anchor, ContextMenu_Item) => {
												ContextMenu_Item($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Cut');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_10, 2);

											$.component(node_11, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_1) => {
												ContextMenu_Item_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Copy');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => ContextMenu.Separator, ($$anchor, ContextMenu_Separator) => {
												ContextMenu_Separator($$anchor, {});
											});

											var node_13 = $.sibling(node_12, 2);

											{
												const child = ($$anchor, $$arg0) => {
													let edit = () => ($$arg0?.()).edit;
													var fragment_8 = $.comment();
													var node_14 = $.first_child(fragment_8);

													$.component(node_14, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_2) => {
														ContextMenu_Item_2($$anchor, {
															get onSelect() {
																return edit();
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_9 = root_1();
																var node_15 = $.sibling($.first_child(fragment_9));

																$.component(node_15, () => ContextMenu.Shortcut, ($$anchor, ContextMenu_Shortcut) => {
																	ContextMenu_Shortcut($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('F2');

																			$.append($$anchor, text_3);
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
												};

												$.component(node_13, () => Rename.Edit, ($$anchor, Rename_Edit) => {
													Rename_Edit($$anchor, { child, $$slots: { child: true } });
												});
											}

											var node_16 = $.sibling(node_13, 2);

											$.component(node_16, () => ContextMenu.Item, ($$anchor, ContextMenu_Item_3) => {
												ContextMenu_Item_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Delete');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
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
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}

$.delegate(['keydown']);