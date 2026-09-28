import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from "$lib/components/web/Logo.svelte";
import { GitHub, Linkedin, Twitter } from "$lib/components/icons";

var root = $.from_html(`<a class="flex size-8 text-muted-foreground transition-colors *:m-auto hover:text-foreground"><!></a>`);
var root_1 = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_2 = $.from_html(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-3xl px-6"><div class="grid gap-8"><div class="col-span-full border-b pb-8"><a href="/" class="flex items-center gap-2"><!></a> <p class="mt-4 max-w-xs text-sm text-muted-foreground">The modern integration platform for teams who ship fast.</p> <div class="mt-6 -ml-2 flex"></div></div> <nav class="flex flex-wrap gap-x-8 gap-y-3"></nav> <div class="border-t pt-8"><p class="text-sm text-muted-foreground"> </p></div></div></div></footer>`);

export default function Footer_four($$anchor, $$props) {
	$.push($$props, true);

	const links = [
		{ label: "Home", href: "#" },
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
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var node = $.child(a);

	Logo(node, { class: 'h-5 w-fit' });
	$.reset(a);

	var div_3 = $.sibling(a, 4);

	$.each(div_3, 21, () => social, (item) => item.label, ($$anchor, item) => {
		var a_1 = root();
		var node_1 = $.child(a_1);

		$.component(node_1, () => $.get(item).icon, ($$anchor, item_icon) => {
			item_icon($$anchor, { class: 'size-4' });
		});

		$.reset(a_1);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', $.get(item).href);
			$.set_attribute(a_1, 'aria-label', $.get(item).label);
		});

		$.append($$anchor, a_1);
	});

	$.reset(div_3);
	$.reset(div_2);

	var nav = $.sibling(div_2, 2);

	$.each(nav, 21, () => links, (link) => link.label, ($$anchor, link) => {
		var a_2 = root_1();
		var text = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(link).href);
			$.set_text(text, $.get(link).label);
		});

		$.append($$anchor, a_2);
	});

	$.reset(nav);

	var div_4 = $.sibling(nav, 2);
	var p = $.child(div_4);
	var text_1 = $.only_child(p);

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text_1, `© ${year ?? ''} Veil, Inc. All rights reserved.`));
	$.append($$anchor, footer);
	$.pop();
}