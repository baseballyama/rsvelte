import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Review } from "flowbite-svelte";

import {
	LandmarkSolid,
	CalendarMonthSolid,
	UsersGroupOutline,
	ThumbsUpSolid,
	ThumbsDownSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex"><!> </div>`);

var root_1 = $.from_html(
	`<p class="mb-2 font-light text-gray-500 dark:text-gray-400">The flat was spotless, very comfortable, and the host was amazing. I highly recommend this accommodation for anyone visiting Brasov city centre. It's quite a while since we are no longer using
    hotel facilities but self contained places. And the main reason is poor cleanliness and staff not being trained properly. This place exceeded our expectation and will return for sure.</p> <p class="mb-5 font-light text-gray-500 dark:text-gray-400">It is obviously not the same build quality as those very expensive watches. But that is like comparing a Citroën to a Ferrari. This watch was well under £100! An absolute bargain.</p>  <aside class="mt-3 flex items-center space-x-5 rtl:space-x-reverse"><a href="/" class="text-primary-600 dark:text-primary-500 inline-flex items-center text-sm font-medium hover:underline"><!> Helpful</a> <a href="/" class="group text-primary-600 dark:text-primary-500 inline-flex items-center text-sm font-medium hover:underline"><!> Not helpful</a></aside>`,
	1
);

export default function Review_1($$anchor) {
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
		const item1 = ($$anchor) => {
			var div = root();
			var node = $.child(div);

			LandmarkSolid(node, { class: 'mr-2 h-5 w-5' });

			var text = $.sibling(node);

			$.reset(div);
			$.template_effect(() => $.set_text(text, ` ${review.item1 ?? ''}`));
			$.append($$anchor, div);
		};

		const item2 = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			CalendarMonthSolid(node_1, { class: 'mr-2 h-5 w-5' });

			var text_1 = $.sibling(node_1);

			$.reset(div_1);
			$.template_effect(() => $.set_text(text_1, ` ${review.item2 ?? ''}`));
			$.append($$anchor, div_1);
		};

		const item3 = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			UsersGroupOutline(node_2, { class: 'mr-2 h-5 w-5' });

			var text_2 = $.sibling(node_2);

			$.reset(div_2);
			$.template_effect(() => $.set_text(text_2, ` ${review.item3 ?? ''}`));
			$.append($$anchor, div_2);
		};

		Review($$anchor, {
			get review() {
				return review;
			},
			item1,
			item2,
			item3,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var aside = $.sibling($.first_child(fragment_1), 4);
				var a = $.child(aside);
				var node_3 = $.child(a);

				ThumbsUpSolid(node_3, {
					class: 'text-primary-600 dark:text-primary-500 me-2.5 h-3.5 w-3.5'
				});

				$.next();
				$.reset(a);

				var a_1 = $.sibling(a, 2);
				var node_4 = $.child(a_1);

				ThumbsDownSolid(node_4, {
					class: 'text-primary-600 dark:text-primary-500 me-2.5 h-3.5 w-3.5'
				});

				$.next();
				$.reset(a_1);
				$.reset(aside);
				$.append($$anchor, fragment_1);
			},
			$$slots: { item1: true, item2: true, item3: true, default: true }
		});
	}
}