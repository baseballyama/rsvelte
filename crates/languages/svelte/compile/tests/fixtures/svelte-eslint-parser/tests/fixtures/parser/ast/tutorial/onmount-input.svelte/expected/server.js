import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Onmount_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let photos = [];

		onMount(async () => {
			const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);

			photos = await res.json();
		});

		$$renderer.push(`<h1>Photo album</h1> <div class="photos svelte-1cah974">`);

		const each_array = $.ensure_array_like(photos);

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let photo = each_array[$$index];

				$$renderer.push(`<figure class="svelte-1cah974"><img${$.attr('src', photo.thumbnailUrl)}${$.attr('alt', photo.title)} class="svelte-1cah974"/> <figcaption>${$.escape(photo.title)}</figcaption></figure>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p>loading...</p>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}