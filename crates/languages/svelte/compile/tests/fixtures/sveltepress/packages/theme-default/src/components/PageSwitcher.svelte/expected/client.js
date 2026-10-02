import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import themOptions from 'virtual:sveltepress/theme-default';
import Next from './icons/Next.svelte';
import Prev from './icons/Prev.svelte';
import { pages } from './layout';
import { getPathFromBase, isLinkActive } from './utils';

var root = $.from_html(`<a class="trigger svelte-r8xjx0"><div class="hint svelte-r8xjx0"> </div> <div class="title svelte-r8xjx0"><div class="switch-icon svelte-r8xjx0"><!></div> <div class="title-label svelte-r8xjx0"> </div></div></a>`);
var root_1 = $.from_html(`<a class="trigger svelte-r8xjx0"><div class="hint svelte-r8xjx0"> </div> <div class="title svelte-r8xjx0"><div class="title-label svelte-r8xjx0"> </div> <div class="switch-icon svelte-r8xjx0"><!></div></div></a>`);
var root_2 = $.from_html(`<div class="page-switcher svelte-r8xjx0"><div><!></div> <div><!></div></div>`);

export default function PageSwitcher($$anchor, $$props) {
	$.push($$props, true);

	const $pages = () => $.store_get(pages, '$pages', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const routeId = page.route.id;
	const activeIdx = $.derived(() => $pages().findIndex((p) => isLinkActive(p.to, routeId)));
	const hasActivePage = $.derived(() => $.get(activeIdx) !== -1);
	const hasPrevPage = $.derived(() => $.get(hasActivePage) && $.get(activeIdx) > 0);
	const hasNextPage = $.derived(() => $.get(hasActivePage) && $.get(activeIdx) < $pages().length - 1);
	const DEFAULT_PREVIOUS_TEXT = 'Previous';
	const DEFAULT_NEXT_TEXT = 'Next';
	var div = root_2();
	var div_1 = $.child(div);
	let classes;
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			const prevPage = $.derived(() => $pages()[$.get(activeIdx) - 1]);
			var a = root();
			var div_2 = $.child(a);
			var text = $.only_child(div_2, true);
			var div_3 = $.sibling(div_2, 2);
			var div_4 = $.child(div_3);
			var node_1 = $.child(div_4);

			Prev(node_1, {});
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var text_1 = $.only_child(div_5, true);

			$.reset(div_3);
			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $0);
					$.set_text(text, themOptions.i18n?.previousPage || DEFAULT_PREVIOUS_TEXT);
					$.set_text(text_1, $.get(prevPage).title);
				},
				[() => getPathFromBase($.get(prevPage).to)]
			);

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($.get(hasPrevPage)) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	let classes_1;
	var node_2 = $.child(div_6);

	{
		var consequent_1 = ($$anchor) => {
			const nextPage = $.derived(() => $pages()[$.get(activeIdx) + 1]);
			var a_1 = root_1();
			var div_7 = $.child(a_1);
			var text_2 = $.only_child(div_7, true);
			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.child(div_8);
			var text_3 = $.only_child(div_9, true);
			var div_10 = $.sibling(div_9, 2);
			var node_3 = $.child(div_10);

			Next(node_3, {});
			$.reset(div_10);
			$.reset(div_8);
			$.reset(a_1);

			$.template_effect(
				($0) => {
					$.set_attribute(a_1, 'href', $0);
					$.set_text(text_2, themOptions.i18n?.nextPage || DEFAULT_NEXT_TEXT);
					$.set_text(text_3, $.get(nextPage).title);
				},
				[() => getPathFromBase($.get(nextPage).to)]
			);

			$.append($$anchor, a_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(hasNextPage)) $$render(consequent_1);
		});
	}

	$.reset(div_6);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div_1, 1, 'svelte-r8xjx0', null, classes, { switcher: $.get(hasPrevPage) });
		classes_1 = $.set_class(div_6, 1, 'right svelte-r8xjx0', null, classes_1, { switcher: $.get(hasNextPage) });
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}