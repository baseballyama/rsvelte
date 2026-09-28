import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li class="type"><a> </a></li>`);
var root_1 = $.from_html(`<ul><li>Types <ul></ul></li></ul>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const links = $$props.data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));
	const types = links.filter((l) => l.href.includes('types'));
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
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}