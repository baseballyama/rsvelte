import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div class="size-20 rounded-full border bg-background p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover" height="460" width="460" loading="lazy"/></div> <span class="mt-2 block text-sm"> </span> <span class="block text-xs text-muted-foreground"> </span></div>`);
var root_1 = $.from_html(`<section class="py-12 md:py-32"><div class="mx-auto max-w-3xl px-8 lg:px-0"><h2 class="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl">Our team</h2> <div><h3 class="mb-6 text-lg font-medium">Leadership</h3> <div class="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4"></div></div> <div class="mt-6"><h3 class="mb-6 text-lg font-medium">Engineering</h3> <div data-rounded="full" class="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4"></div></div> <div class="mt-6"><h3 class="mb-6 text-lg font-medium">Marketing</h3> <div data-rounded="full" class="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4"></div></div></div></section>`);

export default function Team_one($$anchor) {
	const members = [
		{
			name: "Méschac Irung",
			role: "Creator",
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4"
		},

		{
			name: "Bhide Svelte",
			role: "Sveltekit Developer",
			avatar: "https://avatars.githubusercontent.com/u/93428946?v=4"
		},

		{
			name: "Dheeraj Purohit",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/30369664?v=4"
		},

		{
			name: "Aidan Bleser",
			role: "Full Stack Dev",
			avatar: "https://avatars.githubusercontent.com/u/117548273?v=4"
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.sibling($.child(div_1), 2);

	$.each(div_2, 21, () => members, $.index, ($$anchor, member) => {
		var div_3 = root();
		var div_4 = $.child(div_3);
		var img = $.only_child(div_4);
		var span = $.sibling(div_4, 2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_attribute(img, 'alt', $.get(member).name);
			$.set_text(text, $.get(member).name);
			$.set_text(text_1, $.get(member).role);
		});

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.sibling($.child(div_5), 2);

	$.each(div_6, 21, () => members, $.index, ($$anchor, member) => {
		var div_7 = root();
		var div_8 = $.child(div_7);
		var img_1 = $.only_child(div_8);
		var span_2 = $.sibling(div_8, 2);
		var text_2 = $.only_child(span_2, true);
		var span_3 = $.sibling(span_2, 2);
		var text_3 = $.only_child(span_3, true);

		$.reset(div_7);

		$.template_effect(() => {
			$.set_attribute(img_1, 'src', $.get(member).avatar);
			$.set_attribute(img_1, 'alt', $.get(member).name);
			$.set_text(text_2, $.get(member).name);
			$.set_text(text_3, $.get(member).role);
		});

		$.append($$anchor, div_7);
	});

	$.reset(div_6);
	$.reset(div_5);

	var div_9 = $.sibling(div_5, 2);
	var div_10 = $.sibling($.child(div_9), 2);

	$.each(div_10, 21, () => members, $.index, ($$anchor, member) => {
		var div_11 = root();
		var div_12 = $.child(div_11);
		var img_2 = $.only_child(div_12);
		var span_4 = $.sibling(div_12, 2);
		var text_4 = $.only_child(span_4, true);
		var span_5 = $.sibling(span_4, 2);
		var text_5 = $.only_child(span_5, true);

		$.reset(div_11);

		$.template_effect(() => {
			$.set_attribute(img_2, 'src', $.get(member).avatar);
			$.set_attribute(img_2, 'alt', $.get(member).name);
			$.set_text(text_4, $.get(member).name);
			$.set_text(text_5, $.get(member).role);
		});

		$.append($$anchor, div_11);
	});

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}