import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex flex-col gap-4"><div class="relative size-28 shrink-0 rounded-xl shadow-md shadow-foreground/6.5 before:absolute before:inset-0 before:rounded-xl before:border before:border-foreground/10 dark:shadow-black/6.5"><img class="rounded-xl object-cover"/></div> <div class="space-y-1"><p class="text-sm font-medium text-foreground"> </p> <p class="text-sm text-muted-foreground"> </p></div></div>`);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">Meet Our Founders</h2> <p class="text-balance text-muted-foreground">The visionary leaders behind our mission to transform how teams work and
				collaborate.</p></div> <div class="mt-12 grid grid-cols-2 gap-3 gap-y-6 text-sm @xl:grid-cols-3 @xl:gap-6 @xl:gap-12"></div></div></section>`);

export default function Team_two($$anchor) {
	const members = [
		{
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			name: "Meschac Irung",
			role: "Frontend Engineer at Acme"
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/68236786?v=4",
			name: "Theo Balick",
			role: "Founder, CEO - Acme"
		},

		{
			avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
			name: "Sarah Johnson",
			role: "DevOps Engineer"
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => members, $.index, ($$anchor, member) => {
		var div_2 = root();
		var div_3 = $.child(div_2);
		var img = $.child(div_3);

		$.set_attribute(img, 'width', 120);
		$.set_attribute(img, 'height', 120);
		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var p = $.child(div_4);
		var text = $.only_child(p, true);
		var p_1 = $.sibling(p, 2);
		var text_1 = $.only_child(p_1, true);

		$.reset(div_4);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_attribute(img, 'alt', $.get(member).name);
			$.set_text(text, $.get(member).name);
			$.set_text(text_1, $.get(member).role);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}