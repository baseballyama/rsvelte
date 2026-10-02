import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="space-y-3 rounded-2xl bg-card p-4 text-sm text-foreground ring-1 ring-border"><div class="flex gap-3"><div class="relative size-5 shrink-0 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-foreground/10"><img class="rounded-full object-cover"/></div> <p class="text-sm font-medium"> <span class="ml-2 font-normal text-muted-foreground"> </span></p></div> <p class="text-sm text-muted-foreground"> </p></div>`);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">What Our Customers Say</h2> <p class="text-balance text-muted-foreground">Hear from the teams and individuals who have transformed their workflow with our
				platform.</p></div> <div class="mt-12 grid gap-3 @xl:grid-cols-2"></div></div></section>`);

export default function Testimonial_one($$anchor) {
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

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => testimonials, $.index, ($$anchor, testimonial) => {
		var div_2 = root();
		var div_3 = $.child(div_2);
		var div_4 = $.child(div_3);
		var img = $.child(div_4);

		$.set_attribute(img, 'width', 40);
		$.set_attribute(img, 'height', 40);
		$.reset(div_4);

		var p = $.sibling(div_4, 2);
		var text = $.child(p);
		var span = $.sibling(text);
		var text_1 = $.only_child(span, true);

		$.reset(p);
		$.reset(div_3);

		var p_1 = $.sibling(div_3, 2);
		var text_2 = $.only_child(p_1, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(testimonial).avatar);
			$.set_attribute(img, 'alt', $.get(testimonial).name);
			$.set_text(text, `${$.get(testimonial).name ?? ''} `);
			$.set_text(text_1, $.get(testimonial).role);
			$.set_text(text_2, $.get(testimonial).quote);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}