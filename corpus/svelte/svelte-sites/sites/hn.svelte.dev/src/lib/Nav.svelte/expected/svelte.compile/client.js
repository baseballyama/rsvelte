import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<li class="svelte-1escm0m"><a> </a></li>`);
var root_1 = $.from_html(`<nav class="svelte-1escm0m"><a><img alt="Svelte Hacker News logo" class="icon svelte-1escm0m" src="/favicon.png"/></a> <ul class="svelte-1escm0m"><!> <li class="about svelte-1escm0m"><a>about</a></li></ul></nav>`);

export default function Nav($$anchor, $$props) {
	$.push($$props, true);

	const lists = ['top', 'new', 'best', 'show', 'ask', 'jobs'];
	var nav = root_1();
	var a = $.child(nav);
	var ul = $.sibling(a, 2);
	var node = $.child(ul);

	$.each(node, 16, () => lists, (list) => list, ($$anchor, list) => {
		var li = root();
		var a_1 = $.child(li);
		let classes;
		var text = $.only_child(a_1, true);

		$.reset(li);

		$.template_effect(
			($0) => {
				$.set_attribute(a_1, 'href', $0);
				classes = $.set_class(a_1, 1, 'svelte-1escm0m', null, classes, { selected: $$props.section === list });
				$.set_text(text, list);
			},
			[
				() => resolve('/[list=category]/[page=numeric]', { list, page: '1' })
			]
		);

		$.append($$anchor, li);
	});

	var li_1 = $.sibling(node, 2);
	var a_2 = $.child(li_1);
	let classes_1;

	$.reset(li_1);
	$.reset(ul);
	$.reset(nav);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a_2, 'href', $1);
			classes_1 = $.set_class(a_2, 1, 'svelte-1escm0m', null, classes_1, { selected: $$props.section === 'about' });
		},
		[() => resolve('/'), () => resolve('/about')]
	);

	$.append($$anchor, nav);
	$.pop();
}