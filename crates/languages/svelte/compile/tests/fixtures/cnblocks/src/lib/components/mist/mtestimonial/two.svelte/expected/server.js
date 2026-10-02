import * as $ from 'svelte/internal/server';
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";

export default function Two($$renderer) {
	const testimonials = [
		{
			name: "Méschac Irung",
			role: "Creator",
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			content: "Using Tailark has been like unlocking a secret design superpower. It's the perfect fusion of simplicity and versatility."
		},

		{
			name: "Théo Balick",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
			content: "Tailark has transformed the way I develop web applications. The flexibility to customize every aspect is amazing."
		},

		{
			name: "Glodie Lukose",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/99137927?v=4",
			content: "The extensive collection of UI components has significantly accelerated my workflow. Tailark is a game-changer."
		}
	];

	$$renderer.push(`<section><div class="bg-muted py-24"><div class="@container mx-auto w-full max-w-5xl px-6"><div class="mb-12"><h2 class="text-4xl font-semibold text-foreground">What Our Clients Say</h2> <p class="my-4 text-lg text-balance text-muted-foreground">Discover why our clients love working with us. Read their testimonials about our
					dedication to excellence, innovative solutions, and exceptional customer
					service.</p></div> <div class="grid gap-6 @lg:grid-cols-2 @3xl:grid-cols-3"><!--[-->`);

	const each_array = $.ensure_array_like(testimonials);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let testimonial = each_array[$$index];

		$$renderer.push(`<div><div class="rounded-2xl rounded-bl border border-transparent bg-background px-4 py-3 ring-1"><p class="text-foreground">${$.escape(testimonial.content)}</p></div> <div class="mt-4 flex items-center gap-2">`);

		Avatar($$renderer, {
			class: ' size-6 border border-transparent shadow ring-1',
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
}