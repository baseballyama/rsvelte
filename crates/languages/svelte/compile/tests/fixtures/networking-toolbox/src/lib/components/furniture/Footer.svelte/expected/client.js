import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footerLinks } from '$lib/constants/nav';
import { site, author, license } from '$lib/constants/site';

var root = $.from_html(`<a class="svelte-7dtyhk"> </a> `, 1);
var root_1 = $.from_html(`<footer class="footer svelte-7dtyhk"><p class="footer-sub svelte-7dtyhk"><a target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk"> </a> is licensed under <a target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk"> </a>, (C) <a target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk"> </a> </p> <p class="footer-sub svelte-7dtyhk"></p></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	var footer = root_1();
	var p = $.child(footer);
	var a = $.child(p);
	var text = $.only_child(a, true);
	var a_1 = $.sibling(a, 2);
	var text_1 = $.only_child(a_1, true);
	var a_2 = $.sibling(a_1, 2);
	var text_2 = $.only_child(a_2, true);
	var text_3 = $.sibling(a_2);

	$.reset(p);

	var p_1 = $.sibling(p, 2);

	$.each(p_1, 23, () => footerLinks, (item) => item.href, ($$anchor, item, i) => {
		var fragment = root();
		var a_3 = $.first_child(fragment);
		var text_4 = $.only_child(a_3, true);
		var text_5 = $.sibling(a_3, 1, true);

		$.template_effect(() => {
			$.set_attribute(a_3, 'href', $.get(item).href);
			$.set_text(text_4, $.get(item).label);
			$.set_text(text_5, $.get(i) < footerLinks.length - 1 ? ' • ' : '');
		});

		$.append($$anchor, fragment);
	});

	$.reset(p_1);
	$.reset(footer);

	$.template_effect(() => {
		$.set_attribute(a, 'href', site.url);
		$.set_text(text, site.title);
		$.set_attribute(a_1, 'href', license.url);
		$.set_text(text_1, license.name);
		$.set_attribute(a_2, 'href', author.githubUrl);
		$.set_text(text_2, author.name);
		$.set_text(text_3, ` ${license.date ?? ''}`);
	});

	$.append($$anchor, footer);
	$.pop();
}