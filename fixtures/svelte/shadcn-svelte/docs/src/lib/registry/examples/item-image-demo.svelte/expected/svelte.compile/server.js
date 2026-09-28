import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";

export default function Item_image_demo($$renderer) {
	const music = [
		{
			title: "Midnight City Lights",
			artist: "Neon Dreams",
			album: "Electric Nights",
			duration: "3:45"
		},

		{
			title: "Coffee Shop Conversations",
			artist: "The Morning Brew",
			album: "Urban Stories",
			duration: "4:05"
		},

		{
			title: "Digital Rain",
			artist: "Cyber Symphony",
			album: "Binary Beats",
			duration: "3:30"
		}
	];

	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-6"><div class="flex w-full max-w-md flex-col gap-4"><!--[-->`);

	const each_array = $.ensure_array_like(music);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let song = each_array[$$index];

		{
			function child($$renderer, { props }) {
				$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

				if (Item.Media) {
					$$renderer.push('<!--[-->');

					Item.Media($$renderer, {
						variant: 'image',
						children: ($$renderer) => {
							$$renderer.push(`<img${$.attr('src', `https://avatar.vercel.sh/${song.title}`)}${$.attr('alt', song.title)} width="32" height="32" class="size-8 rounded object-cover grayscale"/>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						children: ($$renderer) => {
							if (Item.Title) {
								$$renderer.push('<!--[-->');

								Item.Title($$renderer, {
									class: 'line-clamp-1',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(song.title)} - <span class="text-muted-foreground">${$.escape(song.album)}</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Item.Description) {
								$$renderer.push('<!--[-->');

								Item.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(song.artist)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Item.Content) {
					$$renderer.push('<!--[-->');

					Item.Content($$renderer, {
						class: 'flex-none text-center',
						children: ($$renderer) => {
							if (Item.Description) {
								$$renderer.push('<!--[-->');

								Item.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(song.duration)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</a>`);
			}

			if (Item.Root) {
				$$renderer.push('<!--[-->');
				Item.Root($$renderer, { variant: 'outline', child, $$slots: { child: true } });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	}

	$$renderer.push(`<!--]--></div></div>`);
}