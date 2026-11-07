import * as $ from 'svelte/internal/server';
import * as TreeView from '$lib/components/ui/tree-view';

export default function Tree_view($$renderer) {
	$$renderer.push(`<div class="h-40 w-72">`);

	if (TreeView.Root) {
		$$renderer.push('<!--[-->');

		TreeView.Root($$renderer, {
			children: ($$renderer) => {
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
								TreeView.File($$renderer, { name: 'hooks.server.ts' });
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