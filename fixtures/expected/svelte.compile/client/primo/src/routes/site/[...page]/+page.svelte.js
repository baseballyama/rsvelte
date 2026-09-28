import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { compilers_registered } from '$lib/stores';
import PrimoPage from '$lib/builder/views/editor/Page.svelte';
import { page as pageState } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';
import { resolve_page } from '$lib/pages';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $compilers_registered = () => $.store_get(compilers_registered, '$compilers_registered', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const host = $.derived(() => pageState.url.host);
	const site = $.derived(() => Sites.list({ filter: { host: $.get(host) } })?.[0]);
	const path = $.derived(() => pageState.params.page?.split('/'));
	const page = $.derived(() => $.get(site) && $.get(path) && resolve_page($.get(site), $.get(path)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PrimoPage($$anchor, {
				get page() {
					return $.get(page);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($compilers_registered() && $.get(page)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}