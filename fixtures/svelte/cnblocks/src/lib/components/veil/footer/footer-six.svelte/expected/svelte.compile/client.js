import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from "$lib/components/web/Logo.svelte";
import SocialMediaOne from "./social-media-one.svelte";
import ThemeSwitcher from "./theme-switcher.svelte";

var root = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_1 = $.from_html(`<footer class="@container bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col"><a href="/" aria-label="go home" class="-ml-1.5 flex size-8 rounded-lg *:m-auto hover:bg-foreground/5"><!></a> <nav class="my-8 flex flex-col gap-y-4"></nav> <div class="flex justify-between"><!> <!></div> <p class="mt-2 border-t border-dashed border-foreground/10 pt-6 text-sm text-muted-foreground"> </p></div></div></footer>`);

export default function Footer_six($$anchor, $$props) {
	$.push($$props, true);

	const links = [
		{ label: "Features", href: "#" },
		{ label: "Pricing", href: "#" },
		{ label: "Blog", href: "#" }
	];

	const year = new Date().getFullYear();
	var footer = root_1();
	var div = $.child(footer);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.child(a);

	Logo(node, { class: 'size-5' });
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
	var node_1 = $.child(div_2);

	ThemeSwitcher(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	SocialMediaOne(node_2, {});
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