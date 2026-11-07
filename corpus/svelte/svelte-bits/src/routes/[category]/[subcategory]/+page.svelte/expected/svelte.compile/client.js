import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { decodeLabel } from '$lib/constants/categories';
import { DOC_PAGE_REGISTRY } from '$lib/components/docs/pages/demoRegistry';
import ComingSoon from '$lib/components/docs/pages/ComingSoon.svelte';

var root = $.from_html(`<h1 class="sub-category"> </h1>`);
var root_1 = $.from_html(`<h1 class="sub-category"> </h1> <!>`, 1);
var root_2 = $.from_html(`<div class="category-page"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const sub = $.derived(() => page.params.subcategory ?? '');
	const niceName = $.derived(() => decodeLabel($.get(sub)));
	let loadedSlug = $.state('');
	let PageComponent = $.state(null);
	let loading = $.state(false);

	$.user_effect(() => {
		const slug = $.get(sub);
		const load = DOC_PAGE_REGISTRY[slug];

		$.set(loadedSlug, slug, true);
		$.set(PageComponent, null);

		if (!load) {
			$.set(loading, false);

			return;
		}

		$.set(loading, true);

		load().then((module) => {
			if ($.get(loadedSlug) !== slug) return;

			$.set(PageComponent, module.default, true);
			$.set(loading, false);
		});
	});

	var div = root_2();

	$.head('1pwaes', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${$.get(niceName) ?? ''} - svelte-bits`;
		});
	});

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => $.get(PageComponent), ($$anchor, PageComponent_1) => {
				PageComponent_1($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var h1 = root();
			var text = $.only_child(h1, true);

			$.template_effect(() => $.set_text(text, $.get(niceName)));
			$.append($$anchor, h1);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var h1_1 = $.first_child(fragment_1);
			var text_1 = $.only_child(h1_1, true);
			var node_2 = $.sibling(h1_1, 2);

			ComingSoon(node_2, {
				get name() {
					return $.get(niceName);
				}
			});

			$.template_effect(() => $.set_text(text_1, $.get(niceName)));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(PageComponent)) $$render(consequent); else if ($.get(loading)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}