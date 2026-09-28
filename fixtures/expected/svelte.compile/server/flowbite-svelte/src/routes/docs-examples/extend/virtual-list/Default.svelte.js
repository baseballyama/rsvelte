import * as $ from 'svelte/internal/server';
import { VirtualList } from "flowbite-svelte";

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function getRandomLorem(minWords, maxWords) {
			const lorem = ("Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua").split(" ");
			const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
			let result = [];

			for (let i = 0; i < wordCount; i++) {
				const word = lorem[Math.floor(Math.random() * lorem.length)];

				result.push(word);
			}

			return result.join(" ");
		}

		const items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}: ${getRandomLorem(10, 70)}`);

		{
			function children($$renderer, item, index) {
				$$renderer.push(`<div class="border-b p-2 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">${$.escape(index + 1)}: ${$.escape(item)}</div>`);
			}

			VirtualList($$renderer, {
				items,
				minItemHeight: 40,
				height: 400,
				children,
				$$slots: { default: true }
			});
		}
	});
}