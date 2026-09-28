import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SearchResultList from './SearchResultList.svelte';

var root = $.from_html(`<p class="info fst-400 svelte-16g9f3m">No results</p>`);

export default function SearchResults($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			SearchResultList($$anchor, {
				get results() {
					return $$props.results;
				},

				get query() {
					return $$props.query;
				},

				$$events: {
					select: function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					}
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.results.length > 0) $$render(consequent); else if ($$props.query) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}