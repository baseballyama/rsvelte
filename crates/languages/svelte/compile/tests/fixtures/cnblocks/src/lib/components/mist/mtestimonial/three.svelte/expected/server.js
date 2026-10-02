import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
import { cn } from "$lib/utils";
import Star from "@lucide/svelte/icons/star";

export default function Three($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const testimonials = [
			{
				name: "Méschac Irung",
				role: "Creator",
				avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
				content: "Using Tailark has been like unlocking a secret design superpower. It's the perfect fusion of simplicity and versatility.",
				stars: 5
			},

			{
				name: "Théo Balick",
				role: "Frontend Dev",
				avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
				content: "Tailark has transformed the way I develop web applications. The flexibility to customize every aspect is amazing.",
				stars: 4
			},

			{
				name: "Glodie Lukose",
				role: "Frontend Dev",
				avatar: "https://avatars.githubusercontent.com/u/99137927?v=4",
				content: "The extensive collection of UI components has significantly accelerated my workflow. Tailark is a game-changer.",
				stars: 5
			}
		];

		$$renderer.push(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-24"><div class="@container mx-auto w-full max-w-5xl px-6"><div class="grid gap-6 @lg:grid-cols-2 @3xl:grid-cols-3 @3xl:gap-12"><!--[-->`);

		const each_array = $.ensure_array_like(testimonials);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let testimonial = each_array[$$index_1];

			$$renderer.push(`<div><div class="flex gap-1"><!--[-->`);

			const each_array_1 = $.ensure_array_like(Array.from({ length: 5 }));

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let _ = each_array_1[i];

				Star($$renderer, {
					class: cn("size-4", i < testimonial.stars
						? "fill-primary stroke-primary"
						: "fill-foreground/15 stroke-transparent")
				});
			}

			$$renderer.push(`<!--]--></div> <p class="my-4 text-foreground">${$.escape(testimonial.content)}</p> <div class="flex items-center gap-2">`);

			Avatar($$renderer, {
				class: 'size-6 border border-transparent shadow ring-1',
				children: ($$renderer) => {
					AvatarImage($$renderer, { src: testimonial.avatar, alt: testimonial.name });
					$$renderer.push(`<!----> `);

					AvatarFallback($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(testimonial.name.charAt(0))}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="text-sm font-medium text-foreground">${$.escape(testimonial.name)}</div> <span aria-hidden="true" class="size-1 rounded-full bg-foreground/25"></span> <span class="text-sm text-muted-foreground">${$.escape(testimonial.role)}</span></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div></section>`);
	});
}