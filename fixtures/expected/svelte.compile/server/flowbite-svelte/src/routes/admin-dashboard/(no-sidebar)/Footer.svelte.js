import * as $ from 'svelte/internal/server';

export default function Footer($$renderer) {
	$$renderer.push(`<footer class="px-4 py-6 md:flex md:items-center md:justify-between md:py-10 2xl:px-0"><p class="mb-4 text-center text-sm text-gray-500 md:mb-0">© 2019-2023 <a href="https://flowbite.com/" class="hover:underline" target="_blank">Flowbite.com</a> . All rights reserved</p> <ul class="flex flex-wrap items-center justify-center gap-6"><!--[-->`);

	const each_array = $.ensure_array_like(["Terms", "Licensing", "Cookie Policy", "Contact"]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let elem = each_array[$$index];

		$$renderer.push(`<li><a href="/" class="text-sm font-normal text-gray-500 hover:underline dark:text-gray-300">${$.escape(elem)}</a></li>`);
	}

	$$renderer.push(`<!--]--></ul></footer>`);
}