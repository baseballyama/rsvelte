import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScoreRating } from "flowbite-svelte";

export default function Score($$anchor) {
	let headerLabel = {
		desc1: "8.7",
		desc2: "Excellent",
		desc3: "376 reviews",
		link: { label: "Read all reviews", url: "/" }
	};

	ScoreRating($$anchor, {
		get headerLabel() {
			return headerLabel;
		},

		ratings: [
			{ label: "Staff", rating: 8.8 },
			{ label: "Comfort", rating: 8.9 },
			{ label: "Free WiFi", rating: 8.8 },
			{ label: "Facilities", rating: 5.4 }
		],
		ratings2: [
			{ label: "Value for money", rating: 8.9 },
			{ label: "Cleanliness", rating: 7.0 },
			{ label: "Location", rating: 8.0 }
		]
	});
}