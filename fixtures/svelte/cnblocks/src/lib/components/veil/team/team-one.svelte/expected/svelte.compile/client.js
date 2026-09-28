import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="relative grid grid-cols-[auto_1fr] gap-4"><div class="absolute -inset-x-6 inset-y-1 max-h-26 border-y"></div> <div class="absolute inset-x-1 -inset-y-6 w-26 border-x"></div> <div class="relative size-28 shrink-0 rounded-xl shadow-md shadow-foreground/6.5 before:absolute before:inset-0 before:rounded-xl before:border before:border-foreground/10 dark:shadow-black/6.5"><img class="rounded-xl object-cover"/></div> <div class="flex flex-col justify-between gap-6 py-1"><div class="space-y-0.5"><p class="text-foregroun text-base font-medium"> </p> <p class="text-sm text-muted-foreground"> </p></div> <p class="text-sm text-balance text-muted-foreground"> </p></div></div>`);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">Meet Our Founders</h2> <p class="text-balance text-muted-foreground">The visionary leaders behind our mission to transform how teams work and
				collaborate.</p></div> <div class="mt-12 grid gap-12 text-sm"></div></div></section>`);

export default function Team_one($$anchor) {
	const members = [
		{
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			name: "Meschac Irung",
			role: "Frontend Engineer at Acme",
			bio: "Passionate about intuitive UIs and web performance. Specializes in React and TypeScript with 5+ years of experience."
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
			name: "Theo Balick",
			role: "Founder, CEO - Acme",
			bio: "Serial entrepreneur transforming team collaboration. Previously led product at two successful startups."
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => members, $.index, ($$anchor, member) => {
		var div_2 = root();
		var div_3 = $.child(div_2);

		$.set_attribute(div_3, 'aria-hidden', true);

		var div_4 = $.sibling(div_3, 2);

		$.set_attribute(div_4, 'aria-hidden', true);

		var div_5 = $.sibling(div_4, 2);
		var img = $.child(div_5);

		$.set_attribute(img, 'width', 120);
		$.set_attribute(img, 'height', 120);
		$.reset(div_5);

		var div_6 = $.sibling(div_5, 2);
		var div_7 = $.child(div_6);
		var p = $.child(div_7);
		var text = $.only_child(p, true);
		var p_1 = $.sibling(p, 2);
		var text_1 = $.only_child(p_1, true);

		$.reset(div_7);

		var p_2 = $.sibling(div_7, 2);
		var text_2 = $.only_child(p_2, true);

		$.reset(div_6);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_attribute(img, 'alt', $.get(member).name);
			$.set_text(text, $.get(member).name);
			$.set_text(text_1, $.get(member).role);
			$.set_text(text_2, $.get(member).bio);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}