import * as $ from 'svelte/internal/server';
import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
import CircleFadingPlus from '@lucide/svelte/icons/circle-fading-plus';
import FileInput from '@lucide/svelte/icons/file-input';
import FolderPlus from '@lucide/svelte/icons/folder-plus';
import Search from '@lucide/svelte/icons/search';

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut
} from '$lib/components/ui/command';

export default function Dialog_21($$renderer) {
	let open = false;

	const down = (e) => {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button class="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/20 inline-flex h-9 w-fit rounded-lg border px-3 py-2 text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden"><span class="flex grow items-center">`);

		Search($$renderer, {
			class: 'text-muted-foreground/80 -ms-1 me-3',
			size: 16,
			'aria-hidden': 'true'
		});

		$$renderer.push(`<!----> <span class="text-muted-foreground/70 font-normal">Search</span></span> <kbd class="border-border bg-background text-muted-foreground/70 ms-12 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘K</kbd></button> `);

		CommandDialog($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CommandInput($$renderer, { placeholder: 'Type a command or search...' });
				$$renderer.push(`<!----> `);

				CommandList($$renderer, {
					children: ($$renderer) => {
						CommandEmpty($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->No results found.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						CommandGroup($$renderer, {
							heading: 'Quick start',
							children: ($$renderer) => {
								CommandItem($$renderer, {
									children: ($$renderer) => {
										FolderPlus($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>New folder</span> `);

										CommandShortcut($$renderer, {
											class: 'justify-center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->⌘N`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CommandItem($$renderer, {
									children: ($$renderer) => {
										FileInput($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>Import document</span> `);

										CommandShortcut($$renderer, {
											class: 'justify-center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->⌘I`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CommandItem($$renderer, {
									children: ($$renderer) => {
										CircleFadingPlus($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>Add block</span> `);

										CommandShortcut($$renderer, {
											class: 'justify-center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->⌘B`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						CommandSeparator($$renderer, {});
						$$renderer.push(`<!----> `);

						CommandGroup($$renderer, {
							heading: 'Navigation',
							children: ($$renderer) => {
								CommandItem($$renderer, {
									children: ($$renderer) => {
										ArrowUpRight($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>Go to dashboard</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CommandItem($$renderer, {
									children: ($$renderer) => {
										ArrowUpRight($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>Go to apps</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								CommandItem($$renderer, {
									children: ($$renderer) => {
										ArrowUpRight($$renderer, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
										$$renderer.push(`<!----> <span>Go to connections</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}