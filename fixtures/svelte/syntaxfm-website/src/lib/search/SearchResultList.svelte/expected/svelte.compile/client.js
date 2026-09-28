import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preventDefault } from 'svelte/legacy';
import Icon from '$lib/Icon.svelte';
import { player } from '$state/player';
import { search_recent } from '$state/search';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<span class="text-sm svelte-qth84j"></span>`);
var root_1 = $.from_html(`<button aria-label="Delete" class="button-reset remove-from-recent svelte-qth84j">×</button>`);
var root_2 = $.from_html(`<li class="svelte-qth84j"><button class="play-button svelte-qth84j"><!></button> <a data-sveltekit-preload-data="" class="svelte-qth84j"><strong class="wrap svelte-qth84j"><mark> </mark> <!></strong> <!></a> <!></li>`);
var root_3 = $.from_html(`<ul class="svelte-qth84j"></ul>`);

export default function SearchResultList($$anchor, $$props) {
	$.push($$props, true);

	const $search_recent = () => $.store_get(search_recent, '$search_recent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let recent_searches = $.prop($$props, 'recent_searches', 3, false);
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

	var ul = root_3();

	$.each(ul, 21, () => $$props.results, (result) => result.href, ($$anchor, result) => {
		var li = root_2();
		var button = $.child(li);
		var event_handler = $.derived(() => preventDefault(() => play_show($.get(result))));
		var node = $.child(button);

		Icon(node, { name: 'play' });
		$.reset(button);

		var a = $.sibling(button, 2);
		var strong = $.child(a);
		var mark = $.child(strong);
		var text_1 = $.only_child(mark);
		var node_1 = $.sibling(mark, 2);

		$.html(node_1, () => excerpt($.get(result).breadcrumbs[$.get(result).breadcrumbs.length - 1], $$props.query, false));
		$.reset(strong);

		var node_2 = $.sibling(strong, 2);

		{
			var consequent = ($$anchor) => {
				var span = root();

				$.html(span, () => excerpt($.get(result).node.content, $$props.query), true);
				$.reset(span);
				$.append($$anchor, span);
			};

			var d = $.derived(() => is_tree($.get(result)) && $.get(result).node?.content);

			$.if(node_2, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(a);

		var node_3 = $.sibling(a, 2);

		{
			var consequent_1 = ($$anchor) => {
				var button_1 = root_1();

				$.delegated('click', button_1, (e) => {
					$.store_set(search_recent, $search_recent().filter((href) => href !== $.get(result).href));
					e.stopPropagation();
					e.preventDefault();
				});

				$.append($$anchor, button_1);
			};

			$.if(node_3, ($$render) => {
				if (recent_searches()) $$render(consequent_1);
			});
		}

		$.reset(li);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(a, 'href', $.get(result).href);
				$.set_attribute(a, 'data-has-node', $0);
				$.set_text(text_1, `#${$1 ?? ''}`);
			},
			[
				() => is_tree($.get(result)) ? true : undefined,
				() => is_tree($.get(result)) ? $.get(result).node.number : $.get(result).number
			]
		);

		$.delegated('click', button, function (...$$args) {
			$.get(event_handler)?.apply(this, $$args);
		});

		$.delegated('click', a, () => dispatch('select', { href: $.get(result).href }));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);