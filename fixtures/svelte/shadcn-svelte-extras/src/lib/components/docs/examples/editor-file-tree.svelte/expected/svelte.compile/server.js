import * as $ from 'svelte/internal/server';
import * as TreeView from '$lib/components/ui/tree-view';

export default function Editor_file_tree($$renderer) {
	$$renderer.push(`<div class="border-border h-[825px] w-full border">`);

	if (TreeView.Root) {
		$$renderer.push('<!--[-->');

		TreeView.Root($$renderer, {
			class: 'p-4',
			children: ($$renderer) => {
				if (TreeView.Folder) {
					$$renderer.push('<!--[-->');

					TreeView.Folder($$renderer, {
						name: '.github',
						open: false,
						children: ($$renderer) => {
							if (TreeView.Folder) {
								$$renderer.push('<!--[-->');

								TreeView.Folder($$renderer, {
									name: 'workflows',
									children: ($$renderer) => {
										if (TreeView.File) {
											$$renderer.push('<!--[-->');
											TreeView.File($$renderer, { name: 'ci.yml' });
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

				$$renderer.push(` `);

				if (TreeView.Folder) {
					$$renderer.push('<!--[-->');

					TreeView.Folder($$renderer, {
						name: '.svelte-kit',
						open: false,
						class: 'text-muted-foreground'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.Folder) {
					$$renderer.push('<!--[-->');

					TreeView.Folder($$renderer, {
						name: 'node_modules',
						open: false,
						class: 'text-muted-foreground',
						children: ($$renderer) => {
							if (TreeView.Folder) {
								$$renderer.push('<!--[-->');
								TreeView.Folder($$renderer, { name: 'bits-ui' });
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

				$$renderer.push(` `);

				if (TreeView.Folder) {
					$$renderer.push('<!--[-->');

					TreeView.Folder($$renderer, {
						name: 'src',
						children: ($$renderer) => {
							if (TreeView.Folder) {
								$$renderer.push('<!--[-->');

								TreeView.Folder($$renderer, {
									name: 'lib',
									children: ($$renderer) => {
										if (TreeView.Folder) {
											$$renderer.push('<!--[-->');

											TreeView.Folder($$renderer, {
												name: 'components',
												children: ($$renderer) => {
													if (TreeView.Folder) {
														$$renderer.push('<!--[-->');

														TreeView.Folder($$renderer, {
															name: 'ui',
															children: ($$renderer) => {
																if (TreeView.Folder) {
																	$$renderer.push('<!--[-->');
																	TreeView.Folder($$renderer, { name: 'collapsible', open: false });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (TreeView.Folder) {
																	$$renderer.push('<!--[-->');
																	TreeView.Folder($$renderer, { name: 'tree-view', open: false });
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

										$$renderer.push(` `);

										if (TreeView.Folder) {
											$$renderer.push('<!--[-->');

											TreeView.Folder($$renderer, {
												name: 'utils',
												children: ($$renderer) => {
													if (TreeView.File) {
														$$renderer.push('<!--[-->');
														TreeView.File($$renderer, { name: 'utils.ts' });
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

							$$renderer.push(` `);

							if (TreeView.Folder) {
								$$renderer.push('<!--[-->');

								TreeView.Folder($$renderer, {
									name: 'routes',
									children: ($$renderer) => {
										if (TreeView.File) {
											$$renderer.push('<!--[-->');
											TreeView.File($$renderer, { name: '+layout.svelte' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (TreeView.File) {
											$$renderer.push('<!--[-->');
											TreeView.File($$renderer, { name: '+page.svelte' });
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

							$$renderer.push(` `);

							if (TreeView.File) {
								$$renderer.push('<!--[-->');
								TreeView.File($$renderer, { name: 'app.css' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (TreeView.File) {
								$$renderer.push('<!--[-->');
								TreeView.File($$renderer, { name: 'app.d.ts' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (TreeView.File) {
								$$renderer.push('<!--[-->');
								TreeView.File($$renderer, { name: 'app.html' });
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

				$$renderer.push(` `);

				if (TreeView.Folder) {
					$$renderer.push('<!--[-->');

					TreeView.Folder($$renderer, {
						name: 'static',
						open: false,
						children: ($$renderer) => {
							if (TreeView.File) {
								$$renderer.push('<!--[-->');
								TreeView.File($$renderer, { name: 'favicon.png' });
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

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: '.gitignore' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: '.npmrc' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: '.prettierignore' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: '.prettierrc' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'components.json' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'eslint.config.js' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'LICENSE' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'package.json' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'pnpm-lock.yaml' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'postcss.config.js' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'README.md' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'svelte.config.js' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'tsconfig.json' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'vite.config.ts' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.File) {
					$$renderer.push('<!--[-->');
					TreeView.File($$renderer, { name: 'tailwind.config.ts' });
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