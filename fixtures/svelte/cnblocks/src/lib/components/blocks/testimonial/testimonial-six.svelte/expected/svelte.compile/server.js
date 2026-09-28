import * as $ from 'svelte/internal/server';
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
import { Card, CardContent } from "$lib/components/ui/card";

export default function Testimonial_six($$renderer) {
	const testimonials = [
		{
			name: "Jonathan Yombo",
			role: "Software Engineer",
			image: "https://randomuser.me/api/portraits/men/1.jpg",
			quote: "Tailus is really extraordinary and very practical, no need to break your head. A real gold mine."
		},

		{
			name: "Yves Kalume",
			role: "GDE - Android",
			image: "https://randomuser.me/api/portraits/men/6.jpg",
			quote: "With no experience in webdesign I just redesigned my entire website in a few minutes with tailwindcss thanks to Tailus."
		},

		{
			name: "Yucel Faruksahan",
			role: "Tailkits Creator",
			image: "https://randomuser.me/api/portraits/men/7.jpg",
			quote: "Great work on tailfolio template. This is one of the best personal website that I have seen so far :)"
		},

		{
			name: "Anonymous author",
			role: "Doing something",
			image: "https://randomuser.me/api/portraits/men/8.jpg",
			quote: "I am really new to Tailwind and I want to give a go to make some page on my own. I searched a lot of hero pages and blocks online. However, most of them are not giving me a clear view or needed some HTML/CSS coding background to make some changes from the original or too expensive to have. I downloaded the one of Tailus template which is very clear to understand at the start and you could modify the codes/blocks to fit perfectly on your purpose of the page."
		},

		{
			name: "Shekinah Tshiokufila",
			role: "Senior Software Engineer",
			image: "https://randomuser.me/api/portraits/men/4.jpg",
			quote: "Tailus is redefining the standard of web design, with these blocks it provides an easy and efficient way for those who love beauty but may lack the time to implement it. I can only recommend this incredible wonder."
		},

		{
			name: "Oketa Fred",
			role: "Fullstack Developer",
			image: "https://randomuser.me/api/portraits/men/2.jpg",
			quote: "I absolutely love Tailus! The component blocks are beautifully designed and easy to use, which makes creating a great-looking website a breeze."
		},

		{
			name: "Zeki",
			role: "Founder of ChatExtend",
			image: "https://randomuser.me/api/portraits/men/5.jpg",
			quote: "Using TailsUI has been like unlocking a secret design superpower. It's the perfect fusion of simplicity and versatility, enabling us to create UIs that are as stunning as they are user-friendly."
		},

		{
			name: "Joseph Kitheka",
			role: "Fullstack Developer",
			image: "https://randomuser.me/api/portraits/men/9.jpg",
			quote: "Tailus has transformed the way I develop web applications. Their extensive collection of UI components, blocks, and templates has significantly accelerated my workflow. The flexibility to customize every aspect allows me to create unique user experiences. Tailus is a game-changer for modern web development!"
		},

		{
			name: "Khatab Wedaa",
			role: "MerakiUI Creator",
			image: "https://randomuser.me/api/portraits/men/10.jpg",
			quote: "Tailus is an elegant, clean, and responsive tailwind css components it's very helpful to start fast with your project."
		},

		{
			name: "Rodrigo Aguilar",
			role: "TailwindAwesome Creator",
			image: "https://randomuser.me/api/portraits/men/11.jpg",
			quote: "I love Tailus ❤️. The component blocks are well-structured, simple to use, and beautifully designed. It makes it really easy to have a good-looking website in no time."
		},

		{
			name: "Eric Ampire",
			role: "Mobile Engineer at @BRPNews • @GoogleDevExpert for Android",
			image: "https://randomuser.me/api/portraits/men/12.jpg",
			quote: "Tailus templates are the perfect solution for anyone who wants to create a beautiful and functional website without any web design experience. The templates are easy to use, customizable, and responsive, and the support team is always available to help. I highly recommend Tailus templates to anyone who is looking to create a website."
		},

		{
			name: "Roland Tubonge",
			role: "Software Engineer",
			image: "https://randomuser.me/api/portraits/men/13.jpg",
			quote: "Tailus is so well designed that even with a very poor knowledge of web design you can do miracles. Let yourself be seduced!"
		}
	];

	const chunkArray = (array, chunkSize) => {
		const result = [];

		for (let i = 0; i < array.length; i += chunkSize) {
			result.push(array.slice(i, i + chunkSize));
		}

		return result;
	};

	const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3));

	$$renderer.push(`<section><div class="py-16 md:py-32"><div class="mx-auto max-w-6xl px-6"><div class="text-center"><h2 class="text-title text-3xl font-semibold">Loved by the Community</h2> <p class="text-body mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p></div> <div class="mt-8 grid gap-3 [--color-card:var(--color-muted)] sm:grid-cols-2 md:mt-12 lg:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]"><!--[-->`);

	const each_array = $.ensure_array_like(testimonialChunks);

	for (let chunkIndex = 0, $$length = each_array.length; chunkIndex < $$length; chunkIndex++) {
		let chunk = each_array[chunkIndex];

		$$renderer.push(`<div class="space-y-3 *:border-none *:shadow-none"><!--[-->`);

		const each_array_1 = $.ensure_array_like(chunk);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let { name, role, quote, image } = each_array_1[index];

			Card($$renderer, {
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'grid grid-cols-[auto_1fr] gap-3 pt-6',
						children: ($$renderer) => {
							Avatar($$renderer, {
								class: 'size-9',
								children: ($$renderer) => {
									AvatarImage($$renderer, {
										alt: name,
										src: image,
										loading: 'lazy',
										width: '120',
										height: '120'
									});

									$$renderer.push(`<!----> `);

									AvatarFallback($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->ST`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div><h3 class="font-medium">${$.escape(name)}</h3> <span class="block text-sm tracking-wide text-muted-foreground">${$.escape(role)}</span> <blockquote class="mt-3"><p class="text-gray-700 dark:text-gray-300">${$.escape(quote)}</p></blockquote></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]--></div></div></div></section>`);
}