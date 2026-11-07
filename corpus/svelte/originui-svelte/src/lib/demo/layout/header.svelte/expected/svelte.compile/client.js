import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ThemeToggle from '$lib/demo/theme-toggle.svelte';
import RiArrowRightUpLine from '~icons/ri/arrow-right-up-line';

var root = $.from_html(`<header class="before:bg-[linear-gradient(to_right,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative mb-14 before:absolute before:-inset-x-32 before:bottom-0 before:h-px"><div class="before:bg-svelte after:bg-svelte before:absolute before:-bottom-px before:-left-12 before:z-10 before:-ml-px before:size-[3px] after:absolute after:-right-12 after:-bottom-px after:z-10 after:-mr-px after:size-[3px]" aria-hidden="true"></div> <div class="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-3"><a href="/" aria-label="Home" class="flex items-center gap-2"><span class="sr-only">Origin UI - Svelte</span> <svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg></a> <nav><ul class="flex items-center gap-4"><li><a href="https://github.com/max-got/originui-svelte" target="_blank" class="inline-flex gap-0.5 text-sm hover:underline" rel="noopener noreferrer">GitHub <!></a></li> <li><!></li></ul></nav></div></header>`);

export default function Header($$anchor) {
	var header = root();
	var div = $.sibling($.child(header), 2);
	var nav = $.sibling($.child(div), 2);
	var ul = $.child(nav);
	var li = $.child(ul);
	var a = $.child(li);
	var node = $.sibling($.child(a));

	RiArrowRightUpLine(node, { class: 'text-muted-foreground/80', 'aria-hidden': 'true' });
	$.reset(a);
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_1 = $.child(li_1);

	ThemeToggle(node_1, {});
	$.reset(li_1);
	$.reset(ul);
	$.reset(nav);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}