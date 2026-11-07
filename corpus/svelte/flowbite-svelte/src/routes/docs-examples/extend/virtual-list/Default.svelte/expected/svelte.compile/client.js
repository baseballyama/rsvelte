import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VirtualList } from "flowbite-svelte";

var root = $.from_html(`<div class="border-b p-2 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"> </div>`);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

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
		const children = ($$anchor, item = $.noop, index = $.noop) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => $.set_text(text, `${index() + 1}: ${item() ?? ''}`));
			$.append($$anchor, div);
		};

		VirtualList($$anchor, {
			get items() {
				return items;
			},
			minItemHeight: 40,
			height: 400,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}