import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "$lib/components/ui/hover-card";

var root = $.from_html(`We're hiring <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="font-medium text-foreground"> </span>`, 1);
var root_3 = $.from_svg(`<svg class="fill-muted-foreground stroke-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="1200" height="1227" fill="none" viewBox="0 0 1200 1227"><path fill="#fff" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"></path></svg>`);
var root_4 = $.from_html(`<div class="space-y-3"><div class="flex justify-between"><!> <!></div> <div><span class="font-medium text-foreground"> </span> <div class="text-sm text-muted-foreground"> </div></div></div>`);

var root_5 = $.from_html(`<section><div class="bg-muted/50 py-24 dark:bg-muted/30"><div class="@container mx-auto w-full max-w-5xl px-6"><div class="mb-12"><h2 class="text-4xl font-semibold text-foreground">Meet Our Team</h2> <p class="my-4 text-lg text-balance text-muted-foreground">Our talented professionals bring diverse expertise and passion to every project.
					Together, we collaborate to deliver exceptional results and innovative solutions
					for our clients.</p> <!></div> <div class="grid gap-6 md:gap-y-10 @sm:grid-cols-2 @xl:grid-cols-3 @3xl:grid-cols-4"></div></div></div></section>`);

export default function Two($$anchor) {
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

	var section = root_5();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.sibling($.child(div_2), 4);

	Button(node, {
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
		HoverCard($$anchor, {
			openDelay: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_2 = $.first_child(fragment_2);

				HoverCardTrigger(node_2, {
					class: 'grid cursor-pointer grid-cols-[auto_1fr] items-center gap-2.5',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node_3 = $.first_child(fragment_3);

						Avatar(node_3, {
							class: ' size-6 border border-transparent shadow ring-1',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_4 = $.first_child(fragment_4);

								AvatarImage(node_4, {
									get src() {
										return $.get(member).src;
									},

									get alt() {
										return $.get(member).name;
									}
								});

								var node_5 = $.sibling(node_4, 2);

								AvatarFallback(node_5, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(($0) => $.set_text(text, $0), [() => $.get(member).name.charAt(0)]);
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						var span = $.sibling(node_3, 2);
						var text_1 = $.only_child(span, true);

						$.template_effect(() => $.set_text(text_1, $.get(member).name));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_2, 2);

				HoverCardContent(node_6, {
					'data-theme': 'mist',
					children: ($$anchor, $$slotProps) => {
						var div_4 = root_4();
						var div_5 = $.child(div_4);
						var node_7 = $.child(div_5);

						Avatar(node_7, {
							class: 'size-10  rounded-(--radius) border border-transparent shadow ring-1',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_8 = $.first_child(fragment_6);

								AvatarImage(node_8, {
									get src() {
										return $.get(member).src;
									},

									get alt() {
										return $.get(member).name;
									}
								});

								var node_9 = $.sibling(node_8, 2);

								AvatarFallback(node_9, {
									class: 'rounded-(--radius)',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(member).name.charAt(0)]);
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						var node_10 = $.sibling(node_7, 2);

						Button(node_10, {
							href: 'https://x.com/Sikandar_Bhide',
							variant: 'ghost',
							'aria-label': 'X Account',
							children: ($$anchor, $$slotProps) => {
								var svg = root_3();

								$.append($$anchor, svg);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);

						var div_6 = $.sibling(div_5, 2);
						var span_1 = $.child(div_6);
						var text_3 = $.only_child(span_1, true);
						var div_7 = $.sibling(span_1, 2);
						var text_4 = $.only_child(div_7, true);

						$.reset(div_6);
						$.reset(div_4);

						$.template_effect(() => {
							$.set_text(text_3, $.get(member).name);
							$.set_text(text_4, $.get(member).role);
						});

						$.append($$anchor, div_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}