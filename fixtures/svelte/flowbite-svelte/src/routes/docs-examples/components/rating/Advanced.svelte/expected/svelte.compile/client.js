import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AdvancedRating, Rating } from "flowbite-svelte";

var root = $.from_html(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">3.72 out of 5</p>`);
var root_1 = $.from_html(`<p class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">1,745 global ratings</p>`);

export default function Advanced($$anchor) {
	{
		const rating = ($$anchor) => {
			{
				const text = ($$anchor) => {
					var p = root();

					$.append($$anchor, p);
				};

				Rating($$anchor, {
					total: 5,
					rating: 3.72,
					id: 'example-8',
					text,
					$$slots: { text: true }
				});
			}
		};

		const globalText = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		AdvancedRating($$anchor, {
			ratings: [
				{ label: "5 star", rating: 70 },
				{ label: "4 star", rating: 17 },
				{ label: "3 star", rating: 8 },
				{ label: "2 star", rating: 4 },
				{ label: "1 star", rating: 1 }
			],
			rating,
			globalText,
			$$slots: { rating: true, globalText: true }
		});
	}
}