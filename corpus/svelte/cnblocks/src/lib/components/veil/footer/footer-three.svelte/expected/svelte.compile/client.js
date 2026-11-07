import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from "$lib/components/web/Logo.svelte";

var root = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_1 = $.from_html(`<footer class="@container bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="border-y py-8"><div class="flex flex-col gap-6 @xl:flex-row @xl:items-center"><a href="/" aria-label="home"><!></a> <nav class="flex flex-wrap gap-x-6 gap-y-2 @xl:ml-auto"></nav></div></div> <div class="flex flex-col-reverse gap-4 pt-8 @xl:flex-row @xl:justify-between"><p class="text-sm text-muted-foreground"> </p> <div class="flex flex-wrap gap-4"><a href="/" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</a> <a href="/" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</a> <a href="/" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Cookies</a></div></div></div></footer>`);

export default function Footer_three($$anchor, $$props) {
	$.push($$props, true);

	const links = [
		{ label: "Home", href: "#" },
		{ label: "Features", href: "#" },
		{ label: "Pricing", href: "#" },
		{ label: "About", href: "#" },
		{ label: "Blog", href: "#" },
		{ label: "Contact", href: "#" }
	];

	const year = new Date().getFullYear();
	var footer = root_1();
	var div = $.child(footer);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var node = $.child(a);

	Logo(node, { class: 'h-5 w-fit' });
	$.reset(a);

	var nav = $.sibling(a, 2);

	$.each(nav, 21, () => links, (link) => link.label, ($$anchor, link) => {
		var a_1 = root();
		var text = $.only_child(a_1, true);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', $.get(link).href);
			$.set_text(text, $.get(link).label);
		});

		$.append($$anchor, a_1);
	});

	$.reset(nav);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var p = $.child(div_3);
	var text_1 = $.only_child(p);

	$.next(2);
	$.reset(div_3);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text_1, `© ${year ?? ''} Veil.`));
	$.append($$anchor, footer);
	$.pop();
}