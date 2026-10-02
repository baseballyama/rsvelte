import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="text-muted-foreground relative w-fit"><a class="text-muted-foreground hover:text-foreground relative z-20 text-sm transition-colors"> </a></li>`);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-3 text-center"><h3 class="text-md text-muted-foreground font-serif tracking-wider"> </h3> <ul class="flex flex-col items-center gap-3"></ul></div>`);
var root_2 = $.from_html(`<footer class="before:bg-[linear-gradient(to_right,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative before:absolute before:-inset-x-32 before:top-0 before:h-px"><div class="before:bg-svelte after:bg-svelte before:absolute before:-top-px before:-left-12 before:z-10 before:-ml-px before:size-[3px] after:absolute after:-top-px after:-right-12 after:z-10 after:-mr-px after:size-[3px]" aria-hidden="true"></div> <div class="grid w-full max-w-6xl items-start gap-24 py-6 md:grid-cols-2"></div> <div class="before:bg-[linear-gradient(to_right,--theme(--color-svelte/.3),--theme(--color-border)_200px,--theme(--color-border)_calc(100%-200px),--theme(--color-svelte/.3))] relative flex items-center justify-center py-4 before:absolute before:-inset-x-32 before:top-0 before:h-px"><div class="before:bg-svelte after:bg-svelte before:absolute before:-top-px before:-left-12 before:z-10 before:-ml-px before:size-[3px] after:absolute after:-top-px after:-right-12 after:z-10 after:-mr-px after:size-[3px]" aria-hidden="true"></div> <div class=" flex items-center justify-center gap-3 text-sm"><span class="text-muted-foreground">Created by</span> <a class="group ring-background relative size-8 overflow-hidden rounded-full ring-2 transition-all hover:ring-4" href="https://x.com/max_gotts" target="_blank" rel="noopener noreferrer" aria-label="Visit Max's profile"><enhanced:img class="absolute inset-0 object-cover object-center transition-transform duration-300 group-hover:scale-110" src="/static/avatar.jpg" alt="Max's profile" width="32" height="32" loading="lazy"></enhanced:img></a></div></div></footer>`);

export default function Footer($$anchor, $$props) {
	var footer = root_2();
	var div = $.sibling($.child(footer), 2);

	$.each(div, 21, () => $$props.footerLinks, (section) => section.title, ($$anchor, section) => {
		var div_1 = root_1();
		var h3 = $.child(div_1);
		var text = $.only_child(h3, true);
		var ul = $.sibling(h3, 2);

		$.each(ul, 21, () => $.get(section).links, (link) => link.href, ($$anchor, link) => {
			var li = root();
			var a = $.child(li);
			var text_1 = $.only_child(a, true);

			$.reset(li);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $.get(link).href);
				$.set_attribute(a, 'aria-label', $.get(link)['aria-label']);
				$.set_text(text_1, $.get(link).label);
			});

			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, $.get(section).title));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.next(2);
	$.reset(footer);
	$.append($$anchor, footer);
}