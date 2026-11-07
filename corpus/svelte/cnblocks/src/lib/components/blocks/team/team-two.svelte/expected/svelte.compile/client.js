import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="group overflow-hidden"><img class="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 group-hover:h-[22.5rem] group-hover:rounded-xl hover:grayscale-0" alt="team member" width="826" height="1239"/> <div class="px-2 pt-2 sm:pt-4 sm:pb-0"><div class="flex justify-between"><h3 class="text-title text-base font-medium transition-all duration-500 group-hover:tracking-wider"> </h3> <span class="text-xs"></span></div> <div class="mt-1 flex items-center justify-between"><span class="inline-block translate-y-6 text-sm text-muted-foreground opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"> </span> <a class="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:underline"></a></div></div></div>`);

var root_1 = $.from_html(`<section class="bg-gray-50 py-16 md:py-32 dark:bg-transparent"><div class="mx-auto max-w-5xl border-t px-6"><span class="text-caption -mt-3.5 -ml-6 block w-max bg-gray-50 px-6 dark:bg-gray-950">Team</span> <div class="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24"><div class="sm:w-2/5"><h2 class="text-3xl font-bold sm:text-4xl">Our dream team</h2></div> <div class="mt-6 sm:mt-0"><p>During the working process, we perform regular fitting with the client because
					he is the only person who can feel whether a new suit fits or not.</p></div></div> <div class="mt-12 md:mt-24"><div class="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"></div></div></div></section>`);

export default function Team_two($$anchor) {
	const members = [
		{
			name: "Méschac Irung",
			role: "Creator",
			avatar: "https://avatars.githubusercontent.com/u/47919550?v=4",
			link: "#"
		},

		{
			name: "Bhide Svelte",
			role: "Sveltekit Developer",
			avatar: "https://avatars.githubusercontent.com/u/93428946?v=4",
			link: "#"
		},

		{
			name: "Dheeraj Purohit",
			role: "Frontend Dev",
			avatar: "https://avatars.githubusercontent.com/u/30369664?v=4",
			link: "#"
		},

		{
			name: "Aidan Bleser",
			role: "Full Stack Dev",
			avatar: "https://avatars.githubusercontent.com/u/117548273?v=4",
			link: "#"
		},

		{
			name: "Sean Lynch",
			role: "Product Designer",
			avatar: "https://avatars.githubusercontent.com/u/177476?v=4",
			link: "#"
		},

		{
			name: "Jonathon Reese Perry",
			role: "Creator of Motion Start",
			avatar: "https://avatars.githubusercontent.com/u/30267655?v=4",
			link: "#"
		}
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 4);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => members, $.index, ($$anchor, member, index) => {
		var div_3 = root();
		var img = $.child(div_3);
		var div_4 = $.sibling(img, 2);
		var div_5 = $.child(div_4);
		var h3 = $.child(div_5);
		var text = $.only_child(h3, true);
		var span = $.sibling(h3, 2);

		span.textContent = `_0${index + 1}`;
		$.reset(div_5);

		var div_6 = $.sibling(div_5, 2);
		var span_1 = $.child(div_6);
		var text_1 = $.only_child(span_1, true);
		var a = $.sibling(span_1, 2);

		a.textContent = ' \n									Linktree';
		$.reset(div_6);
		$.reset(div_4);
		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_text(text, $.get(member).name);
			$.set_text(text_1, $.get(member).role);
			$.set_attribute(a, 'href', $.get(member).link);
		});

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}