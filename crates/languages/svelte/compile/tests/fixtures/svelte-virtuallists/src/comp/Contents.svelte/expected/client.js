import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import { base } from '$app/paths';
import { pathIsCurrent } from './pathUtils';

var root = $.from_html(`<li class="svelte-j67pqd"><a data-sveltekit-preload-data="" class="page svelte-j67pqd"> </a></li>`);
var root_1 = $.from_html(`<li class="svelte-j67pqd"><span class="section svelte-j67pqd"> </span> <ul class="svelte-j67pqd"></ul></li>`);
var root_2 = $.from_html(`<nav aria-label="Docs" class="svelte-j67pqd"><ul class="sidebar svelte-j67pqd"></ul></nav>`);

export default function Contents($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let contents = $.prop($$props, 'contents', 19, () => []);
	var nav = root_2();
	var ul = $.child(nav);

	$.each(ul, 20, contents, (section) => section, ($$anchor, section) => {
		var li = root_1();
		var span = $.child(li);
		var text = $.only_child(span, true);
		var ul_1 = $.sibling(span, 2);

		$.each(ul_1, 21, () => section.pages, ({ title, path }) => path, ($$anchor, $$item) => {
			let title = () => $.get($$item).title;
			let path = () => $.get($$item).path;
			var li_1 = root();
			var a = $.child(li_1);
			var text_1 = $.only_child(a, true);

			$.reset(li_1);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'aria-current', $0);
					$.set_attribute(a, 'href', base + path());
					$.set_text(text_1, title());
				},
				[() => pathIsCurrent(path(), $page()) ? 'page' : undefined]
			);

			$.append($$anchor, li_1);
		});

		$.reset(ul_1);
		$.reset(li);
		$.template_effect(() => $.set_text(text, section.title));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(nav);
	$.append($$anchor, nav);
	$.pop();
	$$cleanup();
}