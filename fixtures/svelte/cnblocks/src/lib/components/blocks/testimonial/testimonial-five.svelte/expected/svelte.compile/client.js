import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><h3 class="font-medium"> </h3> <span class="block text-sm tracking-wide text-muted-foreground"> </span> <blockquote class="mt-3"><p class="text-gray-700 dark:text-gray-300"> </p></blockquote></div>`, 1);
var root_2 = $.from_html(`<div class="space-y-3"></div>`);
var root_3 = $.from_html(`<section><div class="py-16 md:py-32"><div class="mx-auto max-w-6xl px-6"><div class="text-center"><h2 class="text-title text-3xl font-semibold">Loved by the Community</h2> <p class="text-body mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p></div> <div class="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3"></div></div></div></section>`);

export default function Testimonial_five($$anchor) {
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
	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);

	$.each(div_2, 21, () => testimonialChunks, $.index, ($$anchor, chunk) => {
		var div_3 = root_2();

		$.each(div_3, 21, () => $.get(chunk), $.index, ($$anchor, $$item) => {
			let name = () => $.get($$item).name;
			let role = () => $.get($$item).role;
			let quote = () => $.get($$item).quote;
			let image = () => $.get($$item).image;

			Card($$anchor, {
				children: ($$anchor, $$slotProps) => {
					CardContent($$anchor, {
						class: 'grid grid-cols-[auto_1fr] gap-3 pt-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node = $.first_child(fragment_2);

							Avatar(node, {
								class: 'size-9',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_1 = $.first_child(fragment_3);

									AvatarImage(node_1, {
										get alt() {
											return name();
										},

										get src() {
											return image();
										},
										loading: 'lazy',
										width: '120',
										height: '120'
									});

									var node_2 = $.sibling(node_1, 2);

									AvatarFallback(node_2, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('ST');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var div_4 = $.sibling(node, 2);
							var h3 = $.child(div_4);
							var text_1 = $.only_child(h3, true);
							var span = $.sibling(h3, 2);
							var text_2 = $.only_child(span, true);
							var blockquote = $.sibling(span, 2);
							var p = $.child(blockquote);
							var text_3 = $.only_child(p, true);

							$.reset(blockquote);
							$.reset(div_4);

							$.template_effect(() => {
								$.set_text(text_1, name());
								$.set_text(text_2, role());
								$.set_text(text_3, quote());
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});

		$.reset(div_3);
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}