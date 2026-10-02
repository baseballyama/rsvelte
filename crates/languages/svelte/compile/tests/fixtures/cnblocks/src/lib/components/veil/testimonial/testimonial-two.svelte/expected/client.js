import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "$lib/components/ui/veil/card";

var root = $.from_html(`<div class="relative size-5 shrink-0 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-foreground/10"><img class="rounded-full object-cover"/></div> <div class="space-y-6"><p class="text-lg text-foreground"> </p> <div class="space-y-1"><p class="text-sm font-medium text-muted-foreground"> </p> <p class="text-xs text-muted-foreground"> </p></div></div>`, 1);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">What Our Customers Say</h2> <p class="text-balance text-muted-foreground">Hear from the teams and individuals who have transformed their workflow with our
				platform.</p></div> <div class="mt-12 grid gap-3 @xl:grid-cols-2"></div></div></section>`);

export default function Testimonial_two($$anchor) {
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
		Card($$anchor, {
			variant: 'outline',
			class: 'flex items-end gap-3 rounded-2xl p-4 text-sm text-foreground',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div_2 = $.first_child(fragment_1);
				var img = $.child(div_2);

				$.set_attribute(img, 'width', 40);
				$.set_attribute(img, 'height', 40);
				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var p = $.child(div_3);
				var text = $.only_child(p, true);
				var div_4 = $.sibling(p, 2);
				var p_1 = $.child(div_4);
				var text_1 = $.only_child(p_1, true);
				var p_2 = $.sibling(p_1, 2);
				var text_2 = $.only_child(p_2, true);

				$.reset(div_4);
				$.reset(div_3);

				$.template_effect(() => {
					$.set_attribute(img, 'src', $.get(testimonial).avatar);
					$.set_attribute(img, 'alt', $.get(testimonial).name);
					$.set_text(text, $.get(testimonial).quote);
					$.set_text(text_1, $.get(testimonial).name);
					$.set_text(text_2, $.get(testimonial).role);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}