import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { compilers_registered } from '$lib/stores';
import PrimoPage from '$lib/builder/views/editor/Page.svelte';
import { page as pageState } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $compilers_registered = () => $.store_get(compilers_registered, '$compilers_registered', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const site_id = $.derived(() => pageState.params.site_id);
	const site = $.derived(() => Sites.one($.get(site_id)));
	const homepage = $.derived(() => $.get(site)?.homepage());
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PrimoPage($$anchor, {
				get page() {
					return $.get(homepage);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($compilers_registered() && $.get(homepage)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}