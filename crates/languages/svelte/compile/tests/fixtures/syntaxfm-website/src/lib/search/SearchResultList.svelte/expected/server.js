import * as $ from 'svelte/internal/server';
import { preventDefault } from 'svelte/legacy';
import Icon from '$lib/Icon.svelte';
import { player } from '$state/player';
import { search_recent } from '$state/search';
import { createEventDispatcher } from 'svelte';

export default function SearchResultList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { results, recent_searches = false, query } = $$props;
		const dispatch = createEventDispatcher();

		function escape(text) {
			return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}

		function excerpt(content, query, trim = true) {
			if (content) {
				const index = content.toLowerCase().indexOf(query?.toLowerCase());

				if (index === -1) {
					return escape(content.slice(0, 100));
				}

				const prefix = index > 20 && trim
					? `…${content.slice(index - 15, index)}`
					: content.slice(0, index);

				const suffix = content.slice(index + query.length, index + query.length + (80 - (prefix.length + query.length)));

				return escape(prefix) + `<mark>${escape(content.slice(index, index + query.length))}</mark>` + escape(suffix);
			}
		}

		function play_show(show_or_tree) {
			const local_show = is_tree(show_or_tree) ? show_or_tree.node : show_or_tree;

			player.start_show(local_show);
		}

		function is_tree(show_or_tree) {
			return 'node' in show_or_tree;
		}

		$$renderer.push(`<ul class="svelte-qth84j"><!--[-->`);

		const each_array = $.ensure_array_like(results);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let result = each_array[$$index];

			$$renderer.push(`<li class="svelte-qth84j"><button class="play-button svelte-qth84j">`);
			Icon($$renderer, { name: 'play' });
			$$renderer.push(`<!----></button> <a data-sveltekit-preload-data=""${$.attr('href', result.href)}${$.attr('data-has-node', is_tree(result) ? true : undefined)} class="svelte-qth84j"><strong class="wrap svelte-qth84j"><mark>#${$.escape(is_tree(result) ? result.node.number : result.number)}</mark> ${$.html(excerpt(result.breadcrumbs[result.breadcrumbs.length - 1], query, false))}</strong> `);

			if (is_tree(result) && result.node?.content) {
				$$renderer.push(`<!--[0--><span class="text-sm svelte-qth84j">${$.html(excerpt(result.node.content, query))}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a> `);

			if (recent_searches) {
				$$renderer.push(`<!--[0--><button aria-label="Delete" class="button-reset remove-from-recent svelte-qth84j">×</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}