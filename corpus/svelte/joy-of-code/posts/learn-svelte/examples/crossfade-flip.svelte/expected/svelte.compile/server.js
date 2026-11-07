import * as $ from 'svelte/internal/server';
import { flip } from 'svelte/animate';
import { crossfade } from 'svelte/transition';

export default function Crossfade_flip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const [send, receive] = crossfade({});

		let posts = [
			{
				id: 1,
				title: 'Post A',
				description: 'Content',
				published: true
			},

			{
				id: 2,
				title: 'Post B',
				description: 'Content',
				published: true
			},

			{
				id: 3,
				title: 'Post C',
				description: 'Content',
				published: true
			},

			{
				id: 4,
				title: 'Post D',
				description: 'Content',
				published: true
			}
		];

		function togglePublished(post) {
			const index = posts.findIndex((p) => p.id === post.id);

			posts[index].published = !posts[index].published;
		}

		function removePost(post) {
			const index = posts.findIndex((p) => p.id === post.id);

			posts.splice(index, 1);
		}

		$$renderer.push(`<div class="container svelte-i6picb"><div><div class="posts svelte-i6picb"><div><section class="svelte-i6picb">`);

		const each_array = $.ensure_array_like(posts.filter((posts) => posts.published));

		if (each_array.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let post = each_array[$$index];

				$$renderer.push(`<article><h3>${$.escape(post.title)}</h3> <p class="svelte-i6picb">${$.escape(post.description)}</p> <div><button class="svelte-i6picb">✏️</button> <button class="svelte-i6picb">💾</button> <button class="svelte-i6picb">❌</button></div></article>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p class="svelte-i6picb">There are no posts.</p>`);
		}

		$$renderer.push(`<!--]--></section></div> <div class="archive svelte-i6picb"><section class="svelte-i6picb">`);

		const each_array_1 = $.ensure_array_like(posts.filter((posts) => !posts.published));

		if (each_array_1.length !== 0) {
			$$renderer.push('<!--[-->');

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let post = each_array_1[$$index_1];

				$$renderer.push(`<article class="svelte-i6picb"><h3>${$.escape(post.title)}</h3> <div><button class="svelte-i6picb">♻️</button></div></article>`);
			}
		} else {
			$$renderer.push(`<!--[!--><p class="svelte-i6picb">Archived items go here.</p>`);
		}

		$$renderer.push(`<!--]--></section></div></div></div></div>`);
	});
}