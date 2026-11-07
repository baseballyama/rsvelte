import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from "$lib/components/web/Logo.svelte";

var root = $.from_html(`<li><a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a></li>`);
var root_1 = $.from_html(`<a class="text-sm text-muted-foreground transition-colors hover:text-foreground"> </a>`);
var root_2 = $.from_html(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="grid grid-cols-2 gap-8 @sm:grid-cols-3"><div class="col-span-full"><a href="/" class="flex items-center gap-2"><!></a> <p class="mt-4 max-w-xs text-sm text-muted-foreground">Building the future of integrations. Connect your tools, automate your workflow.</p></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Product</h3> <ul class="space-y-2"></ul></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Company</h3> <ul class="space-y-2"></ul></div> <div><h3 class="mb-3 text-sm font-medium text-foreground">Resources</h3> <ul class="space-y-2"></ul></div></div> <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"><p class="text-sm text-muted-foreground"> </p> <div class="flex gap-4"></div></div></div></footer>`);

export default function Footer_one($$anchor, $$props) {
	$.push($$props, true);

	const links = {
		product: [
			{ label: "Features", href: "#" },
			{ label: "Integrations", href: "#" },
			{ label: "Pricing", href: "#" },
			{ label: "Changelog", href: "#" }
		],
		company: [
			{ label: "About", href: "#" },
			{ label: "Blog", href: "#" },
			{ label: "Careers", href: "#" },
			{ label: "Contact", href: "#" }
		],
		resources: [
			{ label: "Documentation", href: "#" },
			{ label: "Help Center", href: "#" },
			{ label: "Community", href: "#" },
			{ label: "Templates", href: "#" }
		],
		legal: [
			{ label: "Privacy", href: "#" },
			{ label: "Terms", href: "#" },
			{ label: "Cookie Policy", href: "#" }
		]
	};

	const year = new Date().getFullYear();
	var footer = root_2();
	var div = $.child(footer);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var a = $.child(div_2);
	var node = $.child(a);

	Logo(node, { class: 'h-5 w-fit' });
	$.reset(a);
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var ul = $.sibling($.child(div_3), 2);

	$.each(ul, 21, () => links.product, (link) => link.label, ($$anchor, link) => {
		var li = root();
		var a_1 = $.child(li);
		var text = $.only_child(a_1, true);

		$.reset(li);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', $.get(link).href);
			$.set_text(text, $.get(link).label);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var ul_1 = $.sibling($.child(div_4), 2);

	$.each(ul_1, 21, () => links.company, (link) => link.label, ($$anchor, link) => {
		var li_1 = root();
		var a_2 = $.child(li_1);
		var text_1 = $.only_child(a_2, true);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(link).href);
			$.set_text(text_1, $.get(link).label);
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var ul_2 = $.sibling($.child(div_5), 2);

	$.each(ul_2, 21, () => links.resources, (link) => link.label, ($$anchor, link) => {
		var li_2 = root();
		var a_3 = $.child(li_2);
		var text_2 = $.only_child(a_3, true);

		$.reset(li_2);

		$.template_effect(() => {
			$.set_attribute(a_3, 'href', $.get(link).href);
			$.set_text(text_2, $.get(link).label);
		});

		$.append($$anchor, li_2);
	});

	$.reset(ul_2);
	$.reset(div_5);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var p = $.child(div_6);
	var text_3 = $.only_child(p);
	var div_7 = $.sibling(p, 2);

	$.each(div_7, 21, () => links.legal, (link) => link.label, ($$anchor, link) => {
		var a_4 = root_1();
		var text_4 = $.only_child(a_4, true);

		$.template_effect(() => {
			$.set_attribute(a_4, 'href', $.get(link).href);
			$.set_text(text_4, $.get(link).label);
		});

		$.append($$anchor, a_4);
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);
	$.reset(footer);
	$.template_effect(() => $.set_text(text_3, `© ${year ?? ''} Veil. All rights reserved.`));
	$.append($$anchor, footer);
	$.pop();
}