import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import PageType from '$lib/builder/views/editor/PageType.svelte';
import { PageTypes } from '$lib/pocketbase/collections';
import { compilers_registered } from '$lib/stores';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $compilers_registered = () => $.store_get(compilers_registered, '$compilers_registered', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const page_type_id = $.derived(() => page.params.page_type);
	const page_type = $.derived(() => $.get(page_type_id) && PageTypes.one($.get(page_type_id)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PageType($$anchor, {
				get page_type() {
					return $.get(page_type);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($compilers_registered() && $.get(page_type)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}