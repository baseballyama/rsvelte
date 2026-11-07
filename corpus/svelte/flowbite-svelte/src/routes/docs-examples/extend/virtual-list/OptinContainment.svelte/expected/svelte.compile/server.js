import * as $ from 'svelte/internal/server';
import { VirtualList } from "flowbite-svelte";

export default function OptinContainment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			function children($$renderer, item, _i) {
				$$renderer.push(`<div class="card mb-4 rounded-lg border bg-white p-4 shadow-sm"><img${$.attr('src', item.thumbnail)}${$.attr('alt', item.title)} loading="lazy" decoding="async" class="mb-3 h-48 w-full rounded-md object-cover"/> <h3 class="mb-2 text-xl font-bold">${$.escape(item.title)}</h3> <p class="mb-4 text-gray-600">${$.escape(item.description)}</p> <div class="metadata flex items-center justify-between text-sm text-gray-500"><span class="font-medium">${$.escape(item.author)}</span> <span>${$.escape(item.date)}</span></div> <button class="mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">View More</button></div>`);
			}

			VirtualList($$renderer, {
				items,
				contained: true,
				minItemHeight: 200,
				height: 600,
				children,
				$$slots: { default: true }
			});
		}
	});
}