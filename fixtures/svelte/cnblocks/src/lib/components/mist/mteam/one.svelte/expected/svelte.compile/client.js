import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";

var root = $.from_html(`We're hiring <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[auto_1fr] items-center gap-3"><!> <div><span class="font-medium text-foreground"> </span> <div class="text-sm text-muted-foreground"> </div></div></div>`);

var root_3 = $.from_html(`<section><div class="bg-muted/50 py-24 dark:bg-muted/30"><div class="@container mx-auto w-full max-w-5xl px-6"><div class="mb-12"><h2 class="text-4xl font-semibold text-foreground">Meet Our Team</h2> <p class="my-4 text-lg text-balance text-muted-foreground">Our talented professionals bring diverse expertise and passion to every project.
					Together, we collaborate to deliver exceptional results and innovative solutions
					for our clients.</p> <!></div> <div class="grid gap-6 md:gap-y-10 @sm:grid-cols-2 @xl:grid-cols-3"></div></div></div></section>`);

export default function One($$anchor) {
	const members = [
		{
			src: "https://avatars.githubusercontent.com/u/93428946?v=4",
			name: "Bhide Svelte",
			role: "Svelte Developer"
		},

		{
			src: "https://avatars.githubusercontent.com/u/117548273?v=4",
			name: "Aiden Bleser",
			role: "Creator of jsrepo"
		},

		{
			src: "https://avatars.githubusercontent.com/u/47919550?v=4",
			name: "Meschac Irung",
			role: "Frontend Engineer"
		},

		{
			src: "https://avatars.githubusercontent.com/u/1162160?v=4",
			name: "Rich Harris",
			role: "Creator of Svelte"
		},

		{
			src: "https://avatars.githubusercontent.com/u/64506580?v=4",
			name: "Hunter Johnson",
			role: "Creator of Shadcn-Svelte"
		},

		{
			src: "https://avatars.githubusercontent.com/u/38083522?v=4",
			name: "Matia",
			role: "Joy of Code"
		},

		{
			src: "https://avatars.githubusercontent.com/u/23456789?v=4",
			name: "Aditya Karle",
			role: "UI/UX Designer"
		},

		{
			src: "https://avatars.githubusercontent.com/u/34567890?v=4",
			name: "Saloni Maheshwari",
			role: "Data Scientist"
		},

		{
			src: "https://avatars.githubusercontent.com/u/45678901?v=4",
			name: "Carlos Rodriguez",
			role: "Product Manager"
		},

		{
			src: "https://avatars.githubusercontent.com/u/56789012?v=4",
			name: "Emma Wilson",
			role: "Content Strategist"
		}
	];

	var section = root_3();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling($.child(div_2), 4);

	Button(node, {
		href: '',
		variant: 'outline',
		class: 'pr-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			ChevronRight(node_1, { class: 'opacity-50' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);

	$.each(div_3, 21, () => members, $.index, ($$anchor, member) => {
		var div_4 = root_2();
		var node_2 = $.child(div_4);

		Avatar(node_2, {
			class: 'size-10  rounded-(--radius) border border-transparent shadow ring-1',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_3 = $.first_child(fragment_1);

				AvatarImage(node_3, {
					get src() {
						return $.get(member).src;
					},

					get alt() {
						return $.get(member).name;
					}
				});

				var node_4 = $.sibling(node_3, 2);

				AvatarFallback(node_4, {
					class: 'rounded-(--radius)',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(($0) => $.set_text(text, $0), [() => $.get(member).name.charAt(0)]);
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});

		var div_5 = $.sibling(node_2, 2);
		var span = $.child(div_5);
		var text_1 = $.only_child(span, true);
		var div_6 = $.sibling(span, 2);
		var text_2 = $.only_child(div_6, true);

		$.reset(div_5);
		$.reset(div_4);

		$.template_effect(() => {
			$.set_text(text_1, $.get(member).name);
			$.set_text(text_2, $.get(member).role);
		});

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}