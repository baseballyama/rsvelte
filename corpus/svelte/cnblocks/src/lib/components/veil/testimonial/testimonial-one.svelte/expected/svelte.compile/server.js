import * as $ from 'svelte/internal/server';

export default function Testimonial_one($$renderer) {
	const testimonials = [
		{
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			name: "Meschac Irung",
			role: "Frontend Engineer at Acme",
			quote: "Tailark has been a game-changer for our team. It has helped us to build a modern and scalable web application."
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
			name: "Theo Balick",
			role: "Founder, CEO - Acme",
			quote: "Tailark has been a game-changer for our team. It has helped us to build a modern and scalable web application."
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
			name: "Sarah Johnson",
			role: "DevOps Engineer",
			quote: "Tailark has been a game-changer for our team. It has helped us to build a modern and scalable web application."
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/34567890?v=4",
			name: "Aisha Patel",
			role: "Data Scientist",
			quote: "Tailark has been a game-changer for our team. It has helped us to build a modern and scalable web application."
		}
	];

	$$renderer.push(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">What Our Customers Say</h2> <p class="text-balance text-muted-foreground">Hear from the teams and individuals who have transformed their workflow with our
				platform.</p></div> <div class="mt-12 grid gap-3 @xl:grid-cols-2"><!--[-->`);

	const each_array = $.ensure_array_like(testimonials);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let testimonial = each_array[index];

		$$renderer.push(`<div class="space-y-3 rounded-2xl bg-card p-4 text-sm text-foreground ring-1 ring-border"><div class="flex gap-3"><div class="relative size-5 shrink-0 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-foreground/10"><img${$.attr('src', testimonial.avatar)}${$.attr('alt', testimonial.name)} class="rounded-full object-cover"${$.attr('width', 40)}${$.attr('height', 40)}/></div> <p class="text-sm font-medium">${$.escape(testimonial.name)} <span class="ml-2 font-normal text-muted-foreground">${$.escape(testimonial.role)}</span></p></div> <p class="text-sm text-muted-foreground">${$.escape(testimonial.quote)}</p></div>`);
	}

	$$renderer.push(`<!--]--></div></div></section>`);
}