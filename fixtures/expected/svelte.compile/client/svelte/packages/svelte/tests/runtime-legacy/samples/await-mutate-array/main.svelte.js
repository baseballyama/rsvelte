import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from './Card.svelte';

var root = $.from_html(`<!> ------- <!>`, 1);

export default function Main($$anchor) {
	const x = [
		{ fav: false, x: 1 },
		{ fav: false, x: 2 },
		{ fav: false, x: 3 },
		{ fav: false, x: 4 }
	];

	let p_cards = Promise.resolve(JSON.parse(JSON.stringify(x)));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => p_cards, null, ($$anchor, cards) => {
		var fragment_1 = root();
		var node_1 = $.first_child(fragment_1);

		$.each(node_1, 17, () => $.get(cards).filter((card) => !card.fav), $.index, ($$anchor, card, $$index) => {
			Card($$anchor, {
				get card() {
					return $.get(card);
				},

				onfav: () => {
					($.get(card).fav = !$.get(card).fav);
				}
			});
		});

		var node_2 = $.sibling(node_1, 2);

		$.each(node_2, 17, () => $.get(cards).filter((card) => card.fav), $.index, ($$anchor, card, $$index_1) => {
			Card($$anchor, {
				get card() {
					return $.get(card);
				},

				onfav: () => {
					($.get(card).fav = !$.get(card).fav);
				}
			});
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}