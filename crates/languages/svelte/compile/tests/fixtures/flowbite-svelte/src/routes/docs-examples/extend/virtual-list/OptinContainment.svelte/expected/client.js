import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from "flowbite-svelte";

var root = $.from_html(`<div class="card mb-4 rounded-lg border bg-white p-4 shadow-sm"><img loading="lazy" decoding="async" class="mb-3 h-48 w-full rounded-md object-cover"/> <h3 class="mb-2 text-xl font-bold"> </h3> <p class="mb-4 text-gray-600"> </p> <div class="metadata flex items-center justify-between text-sm text-gray-500"><span class="font-medium"> </span> <span> </span></div> <button class="mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">View More</button></div>`);

export default function OptinContainment($$anchor, $$props) {
	$.push($$props, true);

	const thumbnails = [
		"/images/docs/gallery/square/image.jpg",
		"/images/docs/gallery/square/image-1.jpg",
		"/images/docs/gallery/square/image-2.jpg",
		"/images/docs/gallery/square/image-3.jpg",
		"/images/docs/gallery/square/image-4.jpg"
	];

	const items = Array.from({ length: 5000 }, (_, i) => ({
		id: i + 1,
		thumbnail: thumbnails[i % thumbnails.length],
		title: `Article ${i + 1}: ${[
			"Tech Innovations",
			"Design Trends",
			"Web Development",
			"AI Insights",
			"Product Updates"
		][i % 5]}`,
		description: `This is a detailed description for article ${i + 1}. It contains interesting information about the topic and provides valuable insights for readers.`,
		author: [
			"Alice Johnson",
			"Bob Smith",
			"Carol Williams",
			"David Brown",
			"Emma Davis"
		][i % 5],
		date: new Date(2024, 0, 1 + i % 365).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
	}));

	{
		const children = ($$anchor, item = $.noop, _i = $.noop) => {
			var div = root();
			var img = $.child(div);
			var h3 = $.sibling(img, 2);
			var text = $.only_child(h3, true);
			var p = $.sibling(h3, 2);
			var text_1 = $.only_child(p, true);
			var div_1 = $.sibling(p, 2);
			var span = $.child(div_1);
			var text_2 = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_3 = $.only_child(span_1, true);

			$.reset(div_1);
			$.next(2);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(img, 'src', item().thumbnail);
				$.set_attribute(img, 'alt', item().title);
				$.set_text(text, item().title);
				$.set_text(text_1, item().description);
				$.set_text(text_2, item().author);
				$.set_text(text_3, item().date);
			});

			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return items;
			},
			contained: true,
			minItemHeight: 200,
			height: 600,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}