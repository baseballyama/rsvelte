import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { addToPanel } from '$lib/global.svelte.js';
import { fly } from 'svelte/transition';

var root = $.from_html(`<li class="var svelte-1ktby0k"><a class="svelte-1ktby0k"> </a></li>`);
var root_1 = $.from_html(`<li class="type svelte-1ktby0k"><a class="svelte-1ktby0k"> </a></li>`);
var root_2 = $.from_html(`<li class="svelte-1ktby0k"><a class="svelte-1ktby0k"><span class="fn svelte-1ktby0k"> </span>()</a></li>`);
var root_3 = $.from_html(`<div class="md-types"><!></div>`);
var root_4 = $.from_html(`<ul style="display: none" class="svelte-1ktby0k"><li class="svelte-1ktby0k">Modules <ul class="svelte-1ktby0k"></ul></li> <li class="svelte-1ktby0k">Variables <ul class="svelte-1ktby0k"></ul></li> <li class="svelte-1ktby0k">Types <ul class="svelte-1ktby0k"></ul></li> <!></ul> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const links = $$props.data.docs.map(({ type, title, children }) => ({ title: title[1], href: `/docs/${type}/${title[1]}`, children }));

	addToPanel('links', () => links);

	const fns = links.filter((l) => l.href.includes('functions'));
	const types = links.filter((l) => l.href.includes('types'));
	const vars = links.filter((l) => l.href.includes('variables'));
	const modules = links.filter((l) => l.href.includes('modules'));
	var fragment = root_4();
	var ul = $.first_child(fragment);
	var li = $.child(ul);
	var ul_1 = $.sibling($.child(li));

	$.each(ul_1, 21, () => modules, ({ href, title }) => href, ($$anchor, $$item) => {
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

	$.each(ul_2, 21, () => vars, ({ href, title }) => href, ($$anchor, $$item) => {
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

	$.each(ul_3, 21, () => types, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li_5 = root_1();
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

	var node = $.sibling(li_4, 2);

	$.each(node, 17, () => fns, ({ href, title }) => href, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let title = () => $.get($$item).title;
		var li_6 = root_2();
		var a_3 = $.child(li_6);
		var span = $.child(a_3);
		var text_3 = $.only_child(span, true);

		$.next();
		$.reset(a_3);
		$.reset(li_6);

		$.template_effect(() => {
			$.set_attribute(a_3, 'href', href());
			$.set_text(text_3, title());
		});

		$.append($$anchor, li_6);
	});

	$.reset(ul);

	var node_1 = $.sibling(ul, 2);

	$.key(node_1, () => page.data, ($$anchor) => {
		var div = root_3();
		var node_2 = $.child(div);

		$.snippet(node_2, () => $$props.children);
		$.reset(div);
		$.transition(1, div, () => fly, () => ({ x: -10 }));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}