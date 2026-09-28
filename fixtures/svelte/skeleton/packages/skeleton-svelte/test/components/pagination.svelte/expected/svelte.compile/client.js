import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Pagination_1($$anchor) {
	Pagination($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Pagination.FirstTrigger, ($$anchor, Pagination_FirstTrigger) => {
				Pagination_FirstTrigger($$anchor, { 'data-testid': 'first-trigger' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Pagination.PrevTrigger, ($$anchor, Pagination_PrevTrigger) => {
				Pagination_PrevTrigger($$anchor, { 'data-testid': 'prev-trigger' });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Pagination.Item, ($$anchor, Pagination_Item) => {
				Pagination_Item($$anchor, { type: 'page', value: 0, 'data-testid': 'item' });
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis) => {
				Pagination_Ellipsis($$anchor, { index: 0, 'data-testid': 'ellipsis' });
			});

			var node_4 = $.sibling(node_3, 2);

			$.component(node_4, () => Pagination.NextTrigger, ($$anchor, Pagination_NextTrigger) => {
				Pagination_NextTrigger($$anchor, { 'data-testid': 'next-trigger' });
			});

			var node_5 = $.sibling(node_4, 2);

			$.component(node_5, () => Pagination.LastTrigger, ($$anchor, Pagination_LastTrigger) => {
				Pagination_LastTrigger($$anchor, { 'data-testid': 'last-trigger' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}