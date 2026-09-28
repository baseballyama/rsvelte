import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="type"><a> </a></li>`);
var root_1 = $.from_html(`<ul><li>Types <ul></ul></li> <li>Functions <ul></ul></li> <li>Variables <ul></ul></li></ul>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const links = $$props.data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));
	const types = links.filter((l) => l.href.includes('types'));
	const functions = links.filter((l) => l.href.includes('functions'));
	const variables = links.filter((l) => l.href.includes('variables'));
	var ul = root_1();
	var li = $.child(ul);
	var ul_1 = $.sibling($.child(li));

	$.each(ul_1, 21, () => types, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li_1 = root();
		var a = $.child(li_1);
		var text = $.only_child(a, true);

		$.reset(li_1);

		$.template_effect(() => {
			$.set_attribute(a, 'href', href());
			$.set_text(text, title());
		});

		$.append($$anchor, li_1);
	});

	$.reset(ul_1);
	$.reset(li);

	var li_2 = $.sibling(li, 2);
	var ul_2 = $.sibling($.child(li_2));

	$.each(ul_2, 21, () => functions, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li_3 = root();
		var a_1 = $.child(li_3);
		var text_1 = $.only_child(a_1, true);

		$.reset(li_3);

		$.template_effect(() => {
			$.set_attribute(a_1, 'href', href());
			$.set_text(text_1, title());
		});

		$.append($$anchor, li_3);
	});

	$.reset(ul_2);
	$.reset(li_2);

	var li_4 = $.sibling(li_2, 2);
	var ul_3 = $.sibling($.child(li_4));

	$.each(ul_3, 21, () => variables, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li_5 = root();
		var a_2 = $.child(li_5);
		var text_2 = $.only_child(a_2, true);

		$.reset(li_5);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', href());
			$.set_text(text_2, title());
		});

		$.append($$anchor, li_5);
	});

	$.reset(ul_3);
	$.reset(li_4);
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}