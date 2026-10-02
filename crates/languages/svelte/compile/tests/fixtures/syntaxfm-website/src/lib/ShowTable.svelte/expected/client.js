import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { format } from 'date-fns';

var root = $.from_html(`<span class="topic"> </span>`);
var root_1 = $.from_html(`<tr class="svelte-yjk7gi"><td><span class="show-type fst-500 svelte-yjk7gi"><!></span> <br/> </td><td><a> </a></td><td><a target="_blank"> </a></td><td><span class="topics"></span></td></tr>`);
var root_2 = $.from_html(`<tr class="svelte-yjk7gi"><td class="td-full">No shows scheduled, if there should be, please let someone know</td></tr>`);
var root_3 = $.from_html(`<div class="table-container"><table><thead><tr class="svelte-yjk7gi"><th>Date</th><th>Number</th><th>Title</th><th>Topics</th></tr></thead><tbody><!></tbody></table></div>`);

export default function ShowTable($$anchor, $$props) {
	$.push($$props, true);

	var div = root_3();
	var table = $.child(div);
	var tbody = $.sibling($.child(table));
	var node = $.child(tbody);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $$props.shows, $.index, ($$anchor, show) => {
				var tr = root_1();
				var td = $.child(tr);
				var span = $.child(td);
				var node_2 = $.child(span);

				{
					var consequent = ($$anchor) => {
						var text = $.text('Hasty');

						$.append($$anchor, text);
					};

					var d = $.derived(() => format($.get(show).date, 'EEE') === 'Mon');

					var consequent_1 = ($$anchor) => {
						var text_1 = $.text('Tasty');

						$.append($$anchor, text_1);
					};

					var d_1 = $.derived(() => format($.get(show).date, 'EEE') === 'Wed');

					var consequent_2 = ($$anchor) => {
						var text_2 = $.text('Supper Club');

						$.append($$anchor, text_2);
					};

					var d_2 = $.derived(() => format($.get(show).date, 'EEE') === 'Fri');

					$.if(node_2, ($$render) => {
						if ($.get(d)) $$render(consequent); else if ($.get(d_1)) $$render(consequent_1, 1); else if ($.get(d_2)) $$render(consequent_2, 2);
					});
				}

				$.reset(span);

				var text_3 = $.sibling(span, 3);

				$.reset(td);

				var td_1 = $.sibling(td);
				var a = $.child(td_1);
				var text_4 = $.only_child(a);

				$.reset(td_1);

				var td_2 = $.sibling(td_1);
				var a_1 = $.child(td_2);
				var text_5 = $.only_child(a_1);

				$.reset(td_2);

				var td_3 = $.sibling(td_2);
				var span_1 = $.child(td_3);

				$.each(span_1, 21, () => $.get(show).aiShowNote?.topics?.slice(0, 5) || [], $.index, ($$anchor, topic) => {
					var span_2 = root();
					var text_6 = $.only_child(span_2);

					$.template_effect(($0) => $.set_text(text_6, `${$0 ?? ''}${$.get(topic).name ?? ''}`), [() => $.get(topic).name.startsWith('#') ? '' : '#']);
					$.append($$anchor, span_2);
				});

				$.reset(span_1);
				$.reset(td_3);
				$.reset(tr);

				$.template_effect(
					($0) => {
						$.set_text(text_3, ` ${$0 ?? ''}`);
						$.set_attribute(a, 'href', `/admin/shows/${$.get(show).number ?? ''}`);
						$.set_text(text_4, `${$.get(show).number ?? ''} [↗]`);
						$.set_attribute(a_1, 'href', `/${$.get(show).number ?? ''}`);

						$.set_text(text_5, `${$.get(show).title ?? ''}
								[↗]`);
					},
					[() => format($.get(show).date, 'EEE MMM d')]
				);

				$.append($$anchor, tr);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var tr_1 = root_2();

			$.append($$anchor, tr_1);
		};

		$.if(node, ($$render) => {
			if ($$props.shows.length > 0) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.reset(tbody);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}