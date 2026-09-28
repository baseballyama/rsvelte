import * as $ from 'svelte/internal/server';
import Card from './Card.svelte';

export default function Main($$renderer) {
	const x = [
		{ fav: false, x: 1 },
		{ fav: false, x: 2 },
		{ fav: false, x: 3 },
		{ fav: false, x: 4 }
	];

	let p_cards = Promise.resolve(JSON.parse(JSON.stringify(x)));

	$.await($$renderer, p_cards, () => {}, (cards) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(cards.filter((card) => !card.fav));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let card = each_array[$$index];

			Card($$renderer, {
				card,
				onfav: () => {
					card.fav = !card.fav;
				}
			});
		}

		$$renderer.push(`<!--]--> ------- <!--[-->`);

		const each_array_1 = $.ensure_array_like(cards.filter((card) => card.fav));

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let card = each_array_1[$$index_1];

			Card($$renderer, {
				card,
				onfav: () => {
					card.fav = !card.fav;
				}
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(`<!--]-->`);
}