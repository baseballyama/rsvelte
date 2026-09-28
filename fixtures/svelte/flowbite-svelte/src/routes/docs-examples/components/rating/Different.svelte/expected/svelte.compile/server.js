import * as $ from 'svelte/internal/server';
import { AdvancedRating, Rating, Thumbup } from "flowbite-svelte";

export default function Different($$renderer) {
	{
		function rating($$renderer) {
			{
				function text($$renderer) {
					$$renderer.push(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">3.8 out of 5</p>`);
				}

				Rating($$renderer, {
					total: 5,
					rating: 3.8,
					icon: Thumbup,
					id: 'example-9',
					text,
					$$slots: { text: true }
				});
			}
		}

		function globalText($$renderer) {
			$$renderer.push(`<p class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">1,745 global ratings</p>`);
		}

		AdvancedRating($$renderer, {
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