import * as $ from 'svelte/internal/server';
import * as TreeView from '$lib/components/ui/tree-view';
import * as Icons from '$lib/components/icons';
import FolderDotIcon from '@lucide/svelte/icons/folder-dot';
import FolderOpenDotIcon from '@lucide/svelte/icons/folder-open-dot';

export default function Tree_view_custom_icons($$renderer) {
	$$renderer.push(`<div class="h-40 w-72">`);

	if (TreeView.Root) {
		$$renderer.push('<!--[-->');

		TreeView.Root($$renderer, {
			children: ($$renderer) => {
				{
					function icon($$renderer, { open }) {
						if (open) {
							$$renderer.push('<!--[0-->');
							FolderOpenDotIcon($$renderer, { class: 'size-4' });
						} else {
							$$renderer.push('<!--[-1-->');
							FolderDotIcon($$renderer, { class: 'size-4' });
						}

						$$renderer.push(`<!--]-->`);
					}

					if (TreeView.Folder) {
						$$renderer.push('<!--[-->');

						TreeView.Folder($$renderer, {
							name: '.github',
							icon,
							children: ($$renderer) => {
								if (TreeView.Folder) {
									$$renderer.push('<!--[-->');
									TreeView.Folder($$renderer, { name: 'workflows' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { icon: true, default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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
									name: 'routes',
									children: ($$renderer) => {
										{
											function icon($$renderer, { name }) {
												if (name.endsWith('.svelte')) {
													$$renderer.push('<!--[0-->');

													if (Icons.Svelte) {
														$$renderer.push('<!--[-->');
														Icons.Svelte($$renderer, { class: 'size-4' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											if (TreeView.File) {
												$$renderer.push('<!--[-->');
												TreeView.File($$renderer, { name: '+layout.svelte', icon, $$slots: { icon: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										{
											function icon($$renderer, { name }) {
												if (name.endsWith('.svelte')) {
													$$renderer.push('<!--[0-->');

													if (Icons.Svelte) {
														$$renderer.push('<!--[-->');
														Icons.Svelte($$renderer, { class: 'size-4' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											if (TreeView.File) {
												$$renderer.push('<!--[-->');
												TreeView.File($$renderer, { name: '+page.svelte', icon, $$slots: { icon: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
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

							{
								function icon($$renderer, { name }) {
									if (name.endsWith('.css')) {
										$$renderer.push('<!--[0-->');

										if (Icons.CSS) {
											$$renderer.push('<!--[-->');
											Icons.CSS($$renderer, { class: 'size-3' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (TreeView.File) {
									$$renderer.push('<!--[-->');
									TreeView.File($$renderer, { name: 'app.css', icon, $$slots: { icon: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							{
								function icon($$renderer, { name }) {
									if (name.endsWith('.ts')) {
										$$renderer.push('<!--[0-->');

										if (Icons.TypeScript) {
											$$renderer.push('<!--[-->');
											Icons.TypeScript($$renderer, { class: 'size-3' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (TreeView.File) {
									$$renderer.push('<!--[-->');
									TreeView.File($$renderer, { name: 'hooks.server.ts', icon, $$slots: { icon: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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