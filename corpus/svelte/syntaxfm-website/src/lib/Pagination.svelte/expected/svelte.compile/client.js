import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { page as pageStore } from '$app/stores';
import { PER_PAGE } from '$const';
import { quintOut } from 'svelte/easing';
import { fade } from 'svelte/transition';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div class="pagination svelte-dlb7of"><a title="First Page" class="svelte-dlb7of">←←</a> <a class="svelte-dlb7of">←</a> <!> <a class="svelte-dlb7of">→</a> <a title="Last Page" class="svelte-dlb7of">→→</a></div>`);

export default function Pagination($$anchor, $$props) {
	$.push($$props, true);

	const $pageStore = () => $.store_get(pageStore, '$pageStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let perPage = $.prop($$props, 'perPage', 3, PER_PAGE),
		page = $.prop($$props, 'page', 3, 1);

	let totalPages = $.derived(() => Math.ceil($$props.count / perPage()));

	let generate_search_params = $.derived(() => (id, value) => {
		const searchParams = new URLSearchParams($pageStore().url.search);

		if (!value) {
			searchParams.delete(id);
		} else {
			searchParams.set(id, value.toString());
		}

		return searchParams.toString();
	});

	function getNeighboringNumbers(number, maxNumber) {
		const start = Math.max(1, number - 3);
		const end = Math.min(maxNumber, number + 3);
		const result = Array.from({ length: end - start + 1 }, (_, index) => start + index);

		return result;
	}

	let pageNumbers = $.derived(() => getNeighboringNumbers(page(), $.get(totalPages)));
	var div = root_1();
	var a = $.child(div);
	var a_1 = $.sibling(a, 2);
	var node = $.sibling(a_1, 2);

	$.each(node, 24, () => $.get(pageNumbers), (pageNumber) => pageNumber, ($$anchor, pageNumber) => {
		var a_2 = root();
		let classes;
		var text = $.only_child(a_2, true);

		$.template_effect(
			($0) => {
				classes = $.set_class(a_2, 1, 'page-number svelte-dlb7of', null, classes, { current: page() === pageNumber });
				$.set_attribute(a_2, 'href', `?${$0 ?? ''}`);
				$.set_text(text, pageNumber);
			},
			[() => $.get(generate_search_params)('page', pageNumber)]
		);

		$.transition(1, a_2, () => fade);
		$.animation(a_2, () => flip, () => ({ duration: 200, easing: quintOut }));
		$.append($$anchor, a_2);
	});

	var a_3 = $.sibling(node, 2);
	var a_4 = $.sibling(a_3, 2);

	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_attribute(a, 'href', `?${$0 ?? ''}`);
			$.set_attribute(a_1, 'href', `?${$1 ?? ''}`);
			$.set_attribute(a_3, 'href', `?${$2 ?? ''}`);
			$.set_attribute(a_4, 'href', `?${$3 ?? ''}`);
		},
		[
			() => $.get(generate_search_params)('page', ''),
			() => $.get(generate_search_params)('page', page() > 1 ? page() - 1 : ''),
			() => $.get(generate_search_params)('page', page() + 1),
			() => $.get(generate_search_params)('page', $.get(totalPages))
		]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}