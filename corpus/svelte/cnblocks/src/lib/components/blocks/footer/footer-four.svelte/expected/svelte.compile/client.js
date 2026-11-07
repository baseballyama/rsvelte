import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="block text-muted-foreground duration-150 hover:text-primary"><span> </span></a>`);
var root_1 = $.from_html(`<footer class="border-b bg-white py-12 dark:bg-transparent"><div class="mx-auto max-w-5xl px-6"><div class="flex flex-wrap justify-between gap-6"><span class="order-last block text-center text-sm text-muted-foreground md:order-first"> </span> <div class="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last"></div></div></div></footer>`);

export default function Footer_four($$anchor, $$props) {
	$.push($$props, true);

	const links = [
		{ title: "Features", href: "#" },
		{ title: "Solution", href: "#" },
		{ title: "Customers", href: "#" },
		{ title: "Pricing", href: "#" },
		{ title: "Help", href: "#" },
		{ title: "About", href: "#" }
	];

	var footer = root_1();
	var div = $.child(footer);
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var text = $.only_child(span);
	var div_2 = $.sibling(span, 2);

	$.each(div_2, 21, () => links, $.index, ($$anchor, link) => {
		var a = root();
		var span_1 = $.child(a);
		var text_1 = $.only_child(span_1, true);

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(link).href);
			$.set_text(text_1, $.get(link).title);
		});

		$.append($$anchor, a);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(footer);
	$.template_effect(($0) => $.set_text(text, `© ${$0 ?? ''} Tailus UI, All rights reserved`), [() => new Date().getFullYear()]);
	$.append($$anchor, footer);
	$.pop();
}