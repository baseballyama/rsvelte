import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span>New folder</span> <!>`, 1);
var root_1 = $.from_html(`<!> <span>Import document</span> <!>`, 1);
var root_2 = $.from_html(`<!> <span>Add block</span> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <span>Go to dashboard</span>`, 1);
var root_5 = $.from_html(`<!> <span>Go to apps</span>`, 1);
var root_6 = $.from_html(`<!> <span>Go to connections</span>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<button class="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/20 inline-flex h-9 w-fit rounded-lg border px-3 py-2 text-sm shadow-xs shadow-black/5 transition-shadow focus-visible:ring-[3px] focus-visible:outline-hidden"><span class="flex grow items-center"><!> <span class="text-muted-foreground/70 font-normal">Search</span></span> <kbd class="border-border bg-background text-muted-foreground/70 ms-12 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">⌘K</kbd></button> <!>`, 1);

export default function Dialog_21($$anchor) {
	let open = $.state(false);

	const down = (e) => {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			$.set(open, !$.get(open));
		}
	};

	var fragment = root_9();

	$.event('keydown', $.window, down);

	var button = $.first_child(fragment);
	var span = $.child(button);
	var node = $.child(span);

	Search(node, {
		class: 'text-muted-foreground/80 -ms-1 me-3',
		size: 16,
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(span);
	$.next(2);
	$.reset(button);

	var node_1 = $.sibling(button, 2);

	CommandDialog(node_1, {
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_8();
			var node_2 = $.first_child(fragment_1);

			CommandInput(node_2, { placeholder: 'Type a command or search...' });

			var node_3 = $.sibling(node_2, 2);

			CommandList(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_7();
					var node_4 = $.first_child(fragment_2);

					CommandEmpty(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('No results found.');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					CommandGroup(node_5, {
						heading: 'Quick start',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_6 = $.first_child(fragment_3);

							CommandItem(node_6, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_7 = $.first_child(fragment_4);

									FolderPlus(node_7, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });

									var node_8 = $.sibling(node_7, 4);

									CommandShortcut(node_8, {
										class: 'justify-center',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('⌘N');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_6, 2);

							CommandItem(node_9, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_10 = $.first_child(fragment_5);

									FileInput(node_10, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });

									var node_11 = $.sibling(node_10, 4);

									CommandShortcut(node_11, {
										class: 'justify-center',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('⌘I');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_9, 2);

							CommandItem(node_12, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_13 = $.first_child(fragment_6);

									CircleFadingPlus(node_13, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });

									var node_14 = $.sibling(node_13, 4);

									CommandShortcut(node_14, {
										class: 'justify-center',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('⌘B');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_5, 2);

					CommandSeparator(node_15, {});

					var node_16 = $.sibling(node_15, 2);

					CommandGroup(node_16, {
						heading: 'Navigation',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_17 = $.first_child(fragment_7);

							CommandItem(node_17, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_4();
									var node_18 = $.first_child(fragment_8);

									ArrowUpRight(node_18, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_17, 2);

							CommandItem(node_19, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_5();
									var node_20 = $.first_child(fragment_9);

									ArrowUpRight(node_20, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_19, 2);

							CommandItem(node_21, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_6();
									var node_22 = $.first_child(fragment_10);

									ArrowUpRight(node_22, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.delegated('click', button, () => $.set(open, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);