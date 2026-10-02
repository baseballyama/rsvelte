import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from "$lib/components/web/Logo.svelte";
import ThemeSwitcher from "./theme-switcher.svelte";

var root = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_1 = $.from_html(`<footer class="@container bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col"><a href="/" aria-label="go home" class="-ml-1.5 flex size-8 rounded-lg *:m-auto hover:bg-foreground/5"><!></a> <nav class="my-8 flex flex-wrap gap-x-8 gap-y-2"></nav> <!> <p class="mt-2 border-t pt-6 text-sm text-muted-foreground"> </p></div></div></footer>`);

export default function Footer_five($$anchor, $$props) {
	$.push($$props, true);

	const links = [
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
	var a = $.child(div_1);
	var node = $.child(a);

	Logo(node, { class: 'w-fit' });
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

	var node_1 = $.sibling(nav, 2);

	ThemeSwitcher(node_1, {});

	var p = $.sibling(node_1, 2);
	var text_1 = $.only_child(p);

	$.reset(div_1);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text_1, `© ${year ?? ''} Veil.`));
	$.append($$anchor, footer);
	$.pop();
}