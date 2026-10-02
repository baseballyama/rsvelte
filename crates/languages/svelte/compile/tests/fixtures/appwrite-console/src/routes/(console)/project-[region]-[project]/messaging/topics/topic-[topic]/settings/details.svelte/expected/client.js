import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid } from '$lib/components';
import { toLocaleDateTime } from '$lib/helpers/date';
import { topic, topicTotal } from '../store';

var root = $.from_html(`<div class="u-flex u-main-space-between"><div data-private=""><p class="title"> </p> <p> </p></div></div>`);

export default function Details($$anchor, $$props) {
	$.push($$props, true);

	const $topicTotal = () => $.store_get(topicTotal, '$topicTotal', $$stores);
	const $topic = () => $.store_get(topic, '$topic', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	CardGrid($$anchor, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Details');

				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				var div = root();
				var div_1 = $.child(div);
				var p = $.child(div_1);
				var text_1 = $.only_child(p);
				var p_1 = $.sibling(p, 2);
				var text_2 = $.only_child(p_1);

				$.reset(div_1);
				$.reset(div);

				$.template_effect(
					($0) => {
						$.set_text(text_1, `${$topicTotal() ?? ''} subscriber${$topicTotal() === 1 ? '' : 's'}`);
						$.set_text(text_2, `Created: ${$0 ?? ''}`);
					},
					[() => toLocaleDateTime($topic().$createdAt)]
				);

				$.append($$anchor, div);
			}
		}
	});

	$.pop();
	$$cleanup();
}