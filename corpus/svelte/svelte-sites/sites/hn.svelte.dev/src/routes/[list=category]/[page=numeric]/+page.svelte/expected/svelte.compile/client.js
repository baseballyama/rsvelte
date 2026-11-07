import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import ItemSummary from './ItemSummary.svelte';
import NullItem from './NullItem.svelte';

var root = $.from_html(`<meta name="description"/>`);
var root_1 = $.from_html(`<a class="more">More...</a>`);
var root_2 = $.from_html(`<p>That's all we can find...</p>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const PAGE_SIZE = 30;

	const list = $.derived(() => $$props.data.list),
		items = $.derived(() => $$props.data.items),
		page = $.derived(() => $$props.data.page),
		now = $.derived(() => $$props.data.now);

	const start = $.derived(() => 1 + ($.get(page) - 1) * PAGE_SIZE);
	var fragment = root_3();

	$.head('1n9hwi2', ($$anchor) => {
		var meta = root();

		$.template_effect(() => $.set_attribute(meta, 'content', `Latest Hacker News stories in the ${$.get(list) ?? ''} category`));

		$.effect(() => {
			$.document.title = 'Svelte Hacker News';
		});

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	$.each(node, 19, () => $.get(items), (item) => item.id, ($$anchor, item, i) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				{
					let $0 = $.derived(() => $.get(start) + $.get(i));

					ItemSummary($$anchor, {
						get item() {
							return $.get(item);
						},

						get index() {
							return $.get($0);
						},

						get now() {
							return $.get(now);
						}
					});
				}
			};

			var alternate = ($$anchor) => {
				{
					let $0 = $.derived(() => $.get(start) + $.get(i));

					NullItem($$anchor, {
						get id() {
							return $.get(item).id;
						},

						get index() {
							return $.get($0);
						}
					});
				}
			};

			$.if(node_1, ($$render) => {
				if ($.get(item).type !== 'null') $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a = root_1();

			$.template_effect(($0) => $.set_attribute(a, 'href', $0), [
				() => resolve('/[list=category]/[page=numeric]', { list: $.get(list), page: `${$.get(page) + 1}` })
			]);

			$.append($$anchor, a);
		};

		var alternate_1 = ($$anchor) => {
			var p = root_2();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(items).length >= PAGE_SIZE) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}