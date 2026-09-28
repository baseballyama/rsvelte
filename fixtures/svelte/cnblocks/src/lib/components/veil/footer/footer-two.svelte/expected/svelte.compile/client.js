import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GitHub, Linkedin, Twitter } from "$lib/components/icons";
import Logo from "$lib/components/web/Logo.svelte";

var root = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_1 = $.from_html(`<a class="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"><!></a>`);
var root_2 = $.from_html(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col items-center text-center"><a href="/" class="flex items-center gap-2"><!></a> <nav class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2"></nav> <div class="mt-8 flex gap-4"></div> <p class="mt-8 text-sm text-muted-foreground"> </p></div></div></footer>`);

export default function Footer_two($$anchor, $$props) {
	$.push($$props, true);

	const links = [
		{ label: "Features", href: "#" },
		{ label: "Pricing", href: "#" },
		{ label: "About", href: "#" },
		{ label: "Blog", href: "#" },
		{ label: "Contact", href: "#" }
	];

	const social = [
		{ icon: Twitter, href: "#", label: "Twitter" },
		{ icon: GitHub, href: "#", label: "GitHub" },
		{ icon: Linkedin, href: "#", label: "LinkedIn" }
	];

	const year = new Date().getFullYear();
	var footer = root_2();
	var div = $.child(footer);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.child(a);

	Logo(node, { class: 'h-5' });
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

	var div_2 = $.sibling(nav, 2);

	$.each(div_2, 21, () => social, (item) => item.label, ($$anchor, item) => {
		var a_2 = root_1();
		var node_1 = $.child(a_2);

		$.component(node_1, () => $.get(item).icon, ($$anchor, item_icon) => {
			item_icon($$anchor, { class: 'size-4' });
		});

		$.reset(a_2);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(item).href);
			$.set_attribute(a_2, 'aria-label', $.get(item).label);
		});

		$.append($$anchor, a_2);
	});

	$.reset(div_2);

	var p = $.sibling(div_2, 2);
	var text_1 = $.only_child(p);

	$.reset(div_1);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text_1, `© ${year ?? ''} Veil.`));
	$.append($$anchor, footer);
	$.pop();
}