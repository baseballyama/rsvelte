import * as $ from 'svelte/internal/server';
import { Review } from "flowbite-svelte";

import {
	LandmarkSolid,
	CalendarMonthSolid,
	UsersGroupOutline,
	ThumbsUpSolid,
	ThumbsDownSolid
} from "flowbite-svelte-icons";

export default function Review_1($$renderer) {
	let review = {
		name: "Jese Leos",
		imgSrc: "/images/profile-picture-2.webp",
		imgAlt: "jese leos",
		address: "United States",
		reviewDate: "January 20, 2022",
		title: "Spotless, good appliances, excellent layout, host was genuinely nice and helpful.",
		rating: 8.79,
		item1: "Apartament with City View",
		item2: "3 nights December 2021",
		item3: "Family"
	};

	{
		function item1($$renderer) {
			$$renderer.push(`<div class="flex">`);
			LandmarkSolid($$renderer, { class: 'mr-2 h-5 w-5' });
			$$renderer.push(`<!----> ${$.escape(review.item1)}</div>`);
		}

		function item2($$renderer) {
			$$renderer.push(`<div class="flex">`);
			CalendarMonthSolid($$renderer, { class: 'mr-2 h-5 w-5' });
			$$renderer.push(`<!----> ${$.escape(review.item2)}</div>`);
		}

		function item3($$renderer) {
			$$renderer.push(`<div class="flex">`);
			UsersGroupOutline($$renderer, { class: 'mr-2 h-5 w-5' });
			$$renderer.push(`<!----> ${$.escape(review.item3)}</div>`);
		}

		Review($$renderer, {
			review,
			item1,
			item2,
			item3,
			children: ($$renderer) => {
				$$renderer.push(`<p class="mb-2 font-light text-gray-500 dark:text-gray-400">The flat was spotless, very comfortable, and the host was amazing. I highly recommend this accommodation for anyone visiting Brasov city centre. It's quite a while since we are no longer using
    hotel facilities but self contained places. And the main reason is poor cleanliness and staff not being trained properly. This place exceeded our expectation and will return for sure.</p> <p class="mb-5 font-light text-gray-500 dark:text-gray-400">It is obviously not the same build quality as those very expensive watches. But that is like comparing a Citroën to a Ferrari. This watch was well under £100! An absolute bargain.</p>  <aside class="mt-3 flex items-center space-x-5 rtl:space-x-reverse"><a href="/" class="text-primary-600 dark:text-primary-500 inline-flex items-center text-sm font-medium hover:underline">`);

				ThumbsUpSolid($$renderer, {
					class: 'text-primary-600 dark:text-primary-500 me-2.5 h-3.5 w-3.5'
				});

				$$renderer.push(`<!----> Helpful</a> <a href="/" class="group text-primary-600 dark:text-primary-500 inline-flex items-center text-sm font-medium hover:underline">`);

				ThumbsDownSolid($$renderer, {
					class: 'text-primary-600 dark:text-primary-500 me-2.5 h-3.5 w-3.5'
				});

				$$renderer.push(`<!----> Not helpful</a></aside>`);
			},
			$$slots: { item1: true, item2: true, item3: true, default: true }
		});
	}
}