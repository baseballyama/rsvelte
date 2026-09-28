import * as $ from 'svelte/internal/server';

export default function KeyboardShortcut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { theme = 'primary', shortcuts = [], onShortcutClick } = $$props;

		const onClick = (event) => {
			onShortcutClick?.({ event });
		};

		let bgColor = $.derived(() => theme === 'primary'
			? 'bg-gray-800 dark:bg-dark-mode-gray text-white dark:text-light-gray'
			: 'bg-gray-100 shadow text-black  dark:text-light-gray dark:bg-dark-mode-gray');

		$$renderer.push(`<button${$.attr_class(`p-2 ${bgColor()} mx-2 inline-flex gap-1 font-semibold rounded-md hover:scale-110 transition-transform duration-300`)}><!--[-->`);

		const each_array = $.ensure_array_like(shortcuts);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let shortcut = each_array[$$index];

			$$renderer.push(`<div class="rounded-md h-8 w-8 inline-flex items-center justify-center">${$.escape(shortcut)}</div>`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}