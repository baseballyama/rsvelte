import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as TreeView from '$lib/components/ui/tree-view';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="border-border h-[825px] w-full border"><!></div>`);

export default function Editor_file_tree($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => TreeView.Root, ($$anchor, TreeView_Root) => {
		TreeView_Root($$anchor, {
			class: 'p-4',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => TreeView.Folder, ($$anchor, TreeView_Folder) => {
					TreeView_Folder($$anchor, {
						name: '.github',
						open: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => TreeView.Folder, ($$anchor, TreeView_Folder_1) => {
								TreeView_Folder_1($$anchor, {
									name: 'workflows',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = $.comment();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => TreeView.File, ($$anchor, TreeView_File) => {
											TreeView_File($$anchor, { name: 'ci.yml' });
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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => TreeView.Folder, ($$anchor, TreeView_Folder_2) => {
					TreeView_Folder_2($$anchor, {
						name: '.svelte-kit',
						open: false,
						class: 'text-muted-foreground'
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => TreeView.Folder, ($$anchor, TreeView_Folder_3) => {
					TreeView_Folder_3($$anchor, {
						name: 'node_modules',
						open: false,
						class: 'text-muted-foreground',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => TreeView.Folder, ($$anchor, TreeView_Folder_4) => {
								TreeView_Folder_4($$anchor, { name: 'bits-ui' });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_5, 2);

				$.component(node_7, () => TreeView.Folder, ($$anchor, TreeView_Folder_5) => {
					TreeView_Folder_5($$anchor, {
						name: 'src',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_8 = $.first_child(fragment_4);

							$.component(node_8, () => TreeView.Folder, ($$anchor, TreeView_Folder_6) => {
								TreeView_Folder_6($$anchor, {
									name: 'lib',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_9 = $.first_child(fragment_5);

										$.component(node_9, () => TreeView.Folder, ($$anchor, TreeView_Folder_7) => {
											TreeView_Folder_7($$anchor, {
												name: 'components',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => TreeView.Folder, ($$anchor, TreeView_Folder_8) => {
														TreeView_Folder_8($$anchor, {
															name: 'ui',
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_11 = $.first_child(fragment_7);

																$.component(node_11, () => TreeView.Folder, ($$anchor, TreeView_Folder_9) => {
																	TreeView_Folder_9($$anchor, { name: 'collapsible', open: false });
																});

																var node_12 = $.sibling(node_11, 2);

																$.component(node_12, () => TreeView.Folder, ($$anchor, TreeView_Folder_10) => {
																	TreeView_Folder_10($$anchor, { name: 'tree-view', open: false });
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

										var node_13 = $.sibling(node_9, 2);

										$.component(node_13, () => TreeView.Folder, ($$anchor, TreeView_Folder_11) => {
											TreeView_Folder_11($$anchor, {
												name: 'utils',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_14 = $.first_child(fragment_8);

													$.component(node_14, () => TreeView.File, ($$anchor, TreeView_File_1) => {
														TreeView_File_1($$anchor, { name: 'utils.ts' });
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_8, 2);

							$.component(node_15, () => TreeView.Folder, ($$anchor, TreeView_Folder_12) => {
								TreeView_Folder_12($$anchor, {
									name: 'routes',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_16 = $.first_child(fragment_9);

										$.component(node_16, () => TreeView.File, ($$anchor, TreeView_File_2) => {
											TreeView_File_2($$anchor, { name: '+layout.svelte' });
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => TreeView.File, ($$anchor, TreeView_File_3) => {
											TreeView_File_3($$anchor, { name: '+page.svelte' });
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_18 = $.sibling(node_15, 2);

							$.component(node_18, () => TreeView.File, ($$anchor, TreeView_File_4) => {
								TreeView_File_4($$anchor, { name: 'app.css' });
							});

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => TreeView.File, ($$anchor, TreeView_File_5) => {
								TreeView_File_5($$anchor, { name: 'app.d.ts' });
							});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => TreeView.File, ($$anchor, TreeView_File_6) => {
								TreeView_File_6($$anchor, { name: 'app.html' });
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_7, 2);

				$.component(node_21, () => TreeView.Folder, ($$anchor, TreeView_Folder_13) => {
					TreeView_Folder_13($$anchor, {
						name: 'static',
						open: false,
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_22 = $.first_child(fragment_10);

							$.component(node_22, () => TreeView.File, ($$anchor, TreeView_File_7) => {
								TreeView_File_7($$anchor, { name: 'favicon.png' });
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_23 = $.sibling(node_21, 2);

				$.component(node_23, () => TreeView.File, ($$anchor, TreeView_File_8) => {
					TreeView_File_8($$anchor, { name: '.gitignore' });
				});

				var node_24 = $.sibling(node_23, 2);

				$.component(node_24, () => TreeView.File, ($$anchor, TreeView_File_9) => {
					TreeView_File_9($$anchor, { name: '.npmrc' });
				});

				var node_25 = $.sibling(node_24, 2);

				$.component(node_25, () => TreeView.File, ($$anchor, TreeView_File_10) => {
					TreeView_File_10($$anchor, { name: '.prettierignore' });
				});

				var node_26 = $.sibling(node_25, 2);

				$.component(node_26, () => TreeView.File, ($$anchor, TreeView_File_11) => {
					TreeView_File_11($$anchor, { name: '.prettierrc' });
				});

				var node_27 = $.sibling(node_26, 2);

				$.component(node_27, () => TreeView.File, ($$anchor, TreeView_File_12) => {
					TreeView_File_12($$anchor, { name: 'components.json' });
				});

				var node_28 = $.sibling(node_27, 2);

				$.component(node_28, () => TreeView.File, ($$anchor, TreeView_File_13) => {
					TreeView_File_13($$anchor, { name: 'eslint.config.js' });
				});

				var node_29 = $.sibling(node_28, 2);

				$.component(node_29, () => TreeView.File, ($$anchor, TreeView_File_14) => {
					TreeView_File_14($$anchor, { name: 'LICENSE' });
				});

				var node_30 = $.sibling(node_29, 2);

				$.component(node_30, () => TreeView.File, ($$anchor, TreeView_File_15) => {
					TreeView_File_15($$anchor, { name: 'package.json' });
				});

				var node_31 = $.sibling(node_30, 2);

				$.component(node_31, () => TreeView.File, ($$anchor, TreeView_File_16) => {
					TreeView_File_16($$anchor, { name: 'pnpm-lock.yaml' });
				});

				var node_32 = $.sibling(node_31, 2);

				$.component(node_32, () => TreeView.File, ($$anchor, TreeView_File_17) => {
					TreeView_File_17($$anchor, { name: 'postcss.config.js' });
				});

				var node_33 = $.sibling(node_32, 2);

				$.component(node_33, () => TreeView.File, ($$anchor, TreeView_File_18) => {
					TreeView_File_18($$anchor, { name: 'README.md' });
				});

				var node_34 = $.sibling(node_33, 2);

				$.component(node_34, () => TreeView.File, ($$anchor, TreeView_File_19) => {
					TreeView_File_19($$anchor, { name: 'svelte.config.js' });
				});

				var node_35 = $.sibling(node_34, 2);

				$.component(node_35, () => TreeView.File, ($$anchor, TreeView_File_20) => {
					TreeView_File_20($$anchor, { name: 'tsconfig.json' });
				});

				var node_36 = $.sibling(node_35, 2);

				$.component(node_36, () => TreeView.File, ($$anchor, TreeView_File_21) => {
					TreeView_File_21($$anchor, { name: 'vite.config.ts' });
				});

				var node_37 = $.sibling(node_36, 2);

				$.component(node_37, () => TreeView.File, ($$anchor, TreeView_File_22) => {
					TreeView_File_22($$anchor, { name: 'tailwind.config.ts' });
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}