import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from "@lucide/svelte/icons/arrow-up-right";
import FolderCodeIcon from "@tabler/icons-svelte/icons/folder-code";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Empty_demo($$renderer) {
	if (Empty.Root) {
		$$renderer.push('<!--[-->');

		Empty.Root($$renderer, {
			children: ($$renderer) => {
				if (Empty.Header) {
					$$renderer.push('<!--[-->');

					Empty.Header($$renderer, {
						children: ($$renderer) => {
							if (Empty.Media) {
								$$renderer.push('<!--[-->');

								Empty.Media($$renderer, {
									variant: 'icon',
									children: ($$renderer) => {
										FolderCodeIcon($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Empty.Title) {
								$$renderer.push('<!--[-->');

								Empty.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->No Projects Yet`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Empty.Description) {
								$$renderer.push('<!--[-->');

								Empty.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->You haven't created any projects yet. Get started by creating your first project.`);
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

				if (Empty.Content) {
					$$renderer.push('<!--[-->');

					Empty.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex gap-2">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create Project`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Import Project`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Button($$renderer, {
					variant: 'link',
					class: 'text-muted-foreground',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<a href="#/">Learn More `);
						ArrowUpRightIcon($$renderer, { class: 'inline' });
						$$renderer.push(`<!----></a>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}