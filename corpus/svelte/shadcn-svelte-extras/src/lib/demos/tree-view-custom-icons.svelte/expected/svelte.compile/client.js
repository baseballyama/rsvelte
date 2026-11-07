import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as TreeView from '$lib/components/ui/tree-view';
import * as Icons from '$lib/components/icons';
import FolderDotIcon from '@lucide/svelte/icons/folder-dot';
import FolderOpenDotIcon from '@lucide/svelte/icons/folder-open-dot';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="h-40 w-72"><!></div>`);

export default function Tree_view_custom_icons($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => TreeView.Root, ($$anchor, TreeView_Root) => {
		TreeView_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					const icon = ($$anchor, $$arg0) => {
						let open = () => ($$arg0?.()).open;
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								FolderOpenDotIcon($$anchor, { class: 'size-4' });
							};

							var alternate = ($$anchor) => {
								FolderDotIcon($$anchor, { class: 'size-4' });
							};

							$.if(node_2, ($$render) => {
								if (open()) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => TreeView.Folder, ($$anchor, TreeView_Folder) => {
						TreeView_Folder($$anchor, {
							name: '.github',
							icon,
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => TreeView.Folder, ($$anchor, TreeView_Folder_1) => {
									TreeView_Folder_1($$anchor, { name: 'workflows' });
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { icon: true, default: true }
						});
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => TreeView.Folder, ($$anchor, TreeView_Folder_2) => {
					TreeView_Folder_2($$anchor, {
						name: 'src',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_5 = $.first_child(fragment_5);

							$.component(node_5, () => TreeView.Folder, ($$anchor, TreeView_Folder_3) => {
								TreeView_Folder_3($$anchor, {
									name: 'routes',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_6 = $.first_child(fragment_6);

										{
											const icon = ($$anchor, $$arg0) => {
												let name = () => ($$arg0?.()).name;
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_8 = $.comment();
														var node_8 = $.first_child(fragment_8);

														$.component(node_8, () => Icons.Svelte, ($$anchor, Icons_Svelte) => {
															Icons_Svelte($$anchor, { class: 'size-4' });
														});

														$.append($$anchor, fragment_8);
													};

													var d = $.derived(() => name().endsWith('.svelte'));

													$.if(node_7, ($$render) => {
														if ($.get(d)) $$render(consequent_1);
													});
												}

												$.append($$anchor, fragment_7);
											};

											$.component(node_6, () => TreeView.File, ($$anchor, TreeView_File) => {
												TreeView_File($$anchor, { name: '+layout.svelte', icon, $$slots: { icon: true } });
											});
										}

										var node_9 = $.sibling(node_6, 2);

										{
											const icon = ($$anchor, $$arg0) => {
												let name = () => ($$arg0?.()).name;
												var fragment_9 = $.comment();
												var node_10 = $.first_child(fragment_9);

												{
													var consequent_2 = ($$anchor) => {
														var fragment_10 = $.comment();
														var node_11 = $.first_child(fragment_10);

														$.component(node_11, () => Icons.Svelte, ($$anchor, Icons_Svelte_1) => {
															Icons_Svelte_1($$anchor, { class: 'size-4' });
														});

														$.append($$anchor, fragment_10);
													};

													var d_1 = $.derived(() => name().endsWith('.svelte'));

													$.if(node_10, ($$render) => {
														if ($.get(d_1)) $$render(consequent_2);
													});
												}

												$.append($$anchor, fragment_9);
											};

											$.component(node_9, () => TreeView.File, ($$anchor, TreeView_File_1) => {
												TreeView_File_1($$anchor, { name: '+page.svelte', icon, $$slots: { icon: true } });
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_5, 2);

							{
								const icon = ($$anchor, $$arg0) => {
									let name = () => ($$arg0?.()).name;
									var fragment_11 = $.comment();
									var node_13 = $.first_child(fragment_11);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_12 = $.comment();
											var node_14 = $.first_child(fragment_12);

											$.component(node_14, () => Icons.CSS, ($$anchor, Icons_CSS) => {
												Icons_CSS($$anchor, { class: 'size-3' });
											});

											$.append($$anchor, fragment_12);
										};

										var d_2 = $.derived(() => name().endsWith('.css'));

										$.if(node_13, ($$render) => {
											if ($.get(d_2)) $$render(consequent_3);
										});
									}

									$.append($$anchor, fragment_11);
								};

								$.component(node_12, () => TreeView.File, ($$anchor, TreeView_File_2) => {
									TreeView_File_2($$anchor, { name: 'app.css', icon, $$slots: { icon: true } });
								});
							}

							var node_15 = $.sibling(node_12, 2);

							{
								const icon = ($$anchor, $$arg0) => {
									let name = () => ($$arg0?.()).name;
									var fragment_13 = $.comment();
									var node_16 = $.first_child(fragment_13);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_14 = $.comment();
											var node_17 = $.first_child(fragment_14);

											$.component(node_17, () => Icons.TypeScript, ($$anchor, Icons_TypeScript) => {
												Icons_TypeScript($$anchor, { class: 'size-3' });
											});

											$.append($$anchor, fragment_14);
										};

										var d_3 = $.derived(() => name().endsWith('.ts'));

										$.if(node_16, ($$render) => {
											if ($.get(d_3)) $$render(consequent_4);
										});
									}

									$.append($$anchor, fragment_13);
								};

								$.component(node_15, () => TreeView.File, ($$anchor, TreeView_File_3) => {
									TreeView_File_3($$anchor, { name: 'hooks.server.ts', icon, $$slots: { icon: true } });
								});
							}

							$.append($$anchor, fragment_5);
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