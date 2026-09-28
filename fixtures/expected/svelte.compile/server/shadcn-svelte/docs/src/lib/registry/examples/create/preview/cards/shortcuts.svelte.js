import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Shortcuts($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col gap-3"><div class="text-sm font-medium">Shortcuts</div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between text-sm text-muted-foreground"><span>Search</span> <div class="flex gap-1">`);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->K`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Quick Actions</span> <div class="flex gap-1">`);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->J`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>New File</span> <div class="flex gap-1">`);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->N`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Save</span> <div class="flex gap-1">`);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->S`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Toggle Sidebar</span> <div class="flex gap-1">`);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->⌘`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Kbd($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->B`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div></div></div>`);
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