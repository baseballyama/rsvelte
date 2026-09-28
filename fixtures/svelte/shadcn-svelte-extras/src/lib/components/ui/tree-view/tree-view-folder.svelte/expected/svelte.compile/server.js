import * as $ from 'svelte/internal/server';
import * as Collapsible from '$lib/components/ui/collapsible/index.js';
import FolderIcon from '@lucide/svelte/icons/folder';
import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
import { cn } from '$lib/utils.js';

export default function Tree_view_folder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, open = true, class: className, icon, children } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Collapsible.Root) {
				$$renderer.push('<!--[-->');

				Collapsible.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Collapsible.Trigger) {
							$$renderer.push('<!--[-->');

							Collapsible.Trigger($$renderer, {
								class: cn('flex place-items-center gap-1', className),
								children: ($$renderer) => {
									if (icon) {
										$$renderer.push('<!--[0-->');
										icon($$renderer, { name, open });
										$$renderer.push(`<!---->`);
									} else if (open) {
										$$renderer.push('<!--[1-->');
										FolderOpenIcon($$renderer, { class: 'size-4' });
									} else {
										$$renderer.push('<!--[-1-->');
										FolderIcon($$renderer, { class: 'size-4' });
									}

									$$renderer.push(`<!--]--> <span>${$.escape(name)}</span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Collapsible.Content) {
							$$renderer.push('<!--[-->');

							Collapsible.Content($$renderer, {
								class: 'ml-2 border-l',
								children: ($$renderer) => {
									$$renderer.push(`<div class="relative flex place-items-start"><div class="bg-border mx-2 h-full w-px"></div> <div class="flex flex-1 flex-col">`);
									children?.($$renderer);
									$$renderer.push(`<!----></div></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}