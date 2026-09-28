import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/components/ui/card/card.svelte";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import Globe from "@lucide/svelte/icons/globe";
import Plus from "@lucide/svelte/icons/plus";
import Sparkles from "@lucide/svelte/icons/sparkles";
import Play from "@lucide/svelte/icons/play";
import Signature from "@lucide/svelte/icons/signature";
import CalendarCheck from "@lucide/svelte/icons/calendar-check";
import Target from "@lucide/svelte/icons/target";
import Button from "$lib/components/ui/button/button.svelte";
import Layout from "@lucide/svelte/icons/layout";

const AIAssistantIllustration = ($$anchor) => {
	Card($$anchor, {
		'aria-hidden': true,
		class: 'mt-6 aspect-video translate-y-4 p-4 pb-6 transition-transform duration-200 group-hover:translate-y-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_5();
			var div_7 = $.first_child(fragment_4);
			var node_4 = $.child(div_7);

			Sparkles(node_4, { class: 'size-3.5 fill-purple-300 stroke-purple-300' });
			$.next(2);
			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var div_9 = $.sibling($.child(div_8), 2);
			var div_10 = $.child(div_9);
			var node_5 = $.child(div_10);

			Button(node_5, {
				variant: 'outline',
				size: 'icon',
				class: 'size-7 rounded-2xl bg-transparent shadow-none',
				children: ($$anchor, $$slotProps) => {
					Plus($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				variant: 'outline',
				size: 'icon',
				class: 'size-7 rounded-2xl bg-transparent shadow-none',
				children: ($$anchor, $$slotProps) => {
					Globe($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.reset(div_10);

			var node_7 = $.sibling(div_10, 2);

			Button(node_7, {
				size: 'icon',
				variant: 'mdefault',
				class: 'size-7 rounded-2xl',
				children: ($$anchor, $$slotProps) => {
					ArrowUp($$anchor, { strokeWidth: 3 });
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_8);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});
};

var root = $.from_html(`<div class="size-7 rounded-full border bg-background p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover" height="460" width="460"/></div>`);
var root_1 = $.from_html(`<div class="relative hidden h-fit"><div class="absolute bottom-1.5 -left-1.5 rounded-md border-t border-red-700 bg-red-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-red-500/35">PDF</div> <div class="h-10 w-8 rounded-md border bg-gradient-to-b from-zinc-100 to-zinc-200"></div></div> <div class="mb-0.5 text-sm font-semibold">AI Strategy Meeting</div> <div class="mb-4 flex gap-2 text-sm"><span class="text-muted-foreground">2:30 - 3:45 PM</span></div> <div class="mb-2 flex -space-x-1.5"><div class="flex -space-x-1.5"></div></div> <div class="text-sm font-medium text-muted-foreground">ML Pipeline Discussion</div>`, 1);
var root_2 = $.from_html(`<div class="mb-3 flex items-center gap-2"><div class="size-6 rounded-full border bg-background p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover" alt="Bhide Svelte" height="460" width="460"/></div> <span class="text-sm font-medium text-muted-foreground">Bhide Svelte</span> <span class="text-xs text-muted-foreground/75">2m</span></div> <div class="ml-8 space-y-2"><div class="h-2 rounded-full bg-foreground/10"></div> <div class="h-2 w-3/5 rounded-full bg-foreground/10"></div> <div class="h-2 w-1/2 rounded-full bg-foreground/10"></div></div> <!>`, 1);
var root_3 = $.from_html(`<div class="m-auto flex size-10 rounded-full bg-foreground/5"><!></div>`);
var root_4 = $.from_html(`<div aria-hidden="true" class="relative mt-6"><!> <!></div>`);

var root_5 = $.from_html(
	`<div class="w-fit"><!> <p class="mt-2 line-clamp-2 text-sm">How can I optimize my neural network to reduce inference time while maintaining
				accuracy?</p></div> <div class="-mx-3 mt-3 -mb-3 space-y-3 rounded-lg bg-foreground/5 p-3"><div class="text-sm text-muted-foreground">Ask AI Assistant</div> <div class="flex justify-between"><div class="flex gap-2"><!> <!></div> <!></div></div>`,
	1
);

var root_6 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">AI Code Generation</h3> <p class="mt-3 max-w-xl text-balance text-muted-foreground">Our advanced AI models transform natural language into production-ready
						code, streamlining development workflows and enabling faster iteration.</p> <div class="-mt-2 mr-0.5 -ml-2 mask-b-from-95% pt-2 pl-2"><div class="relative mx-auto mt-8 h-96 overflow-hidden rounded-tl-(--radius) border border-transparent bg-background shadow ring-1"><img src="/mist/tailark-2.png" alt="app screen" width="2880" height="1842" class="h-full object-cover object-top-left"/></div></div>`,
	1
);

var root_7 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">AI Code Generation</h3> <p class="mt-3 text-balance text-muted-foreground">Our advanced AI models transform natural language into production-ready
						code.</p> <!>`,
	1
);

var root_8 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">Intelligent Code Review</h3> <p class="mt-3 text-balance text-muted-foreground">Our AI analyzes your code for bugs, security issues, and optimization
						opportunities.</p> <!>`,
	1
);

var root_9 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">Contextual AI Assistant</h3> <p class="mt-3 text-balance text-muted-foreground">A personalized AI companion that understands your codebase and helps solve
						complex...</p> <div class="-mx-2 -mt-2 mask-b-from-50 px-2 pt-2"><!></div>`,
	1
);

var root_10 = $.from_html(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)] dark:[--color-primary:theme(color.indigo.400)] dark:[--color-secondary-foreground:theme(color.indigo.500)] dark:[--color-secondary:theme(color.indigo.400)]"><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"><!> <!> <!> <!></div></div></div></section>`);

export default function Seven($$anchor) {
	const MettingIllustration = ($$anchor) => {
		Card($$anchor, {
			'aria-hidden': 'true',
			class: 'mt-9 aspect-video p-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div = $.sibling($.first_child(fragment_1), 6);
				var div_1 = $.child(div);

				$.each(div_1, 21, () => avatars, $.index, ($$anchor, avatar) => {
					var div_2 = root();
					var img = $.only_child(div_2);

					$.template_effect(() => {
						$.set_attribute(img, 'src', $.get(avatar).src);
						$.set_attribute(img, 'alt', $.get(avatar).alt);
					});

					$.append($$anchor, div_2);
				});

				$.reset(div_1);
				$.reset(div);
				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	};

	const CodeReviewIllustration = ($$anchor) => {
		var div_3 = root_4();
		var node = $.child(div_3);

		Card(node, {
			class: 'aspect-video w-4/5 translate-y-4 p-3 transition-transform duration-200 ease-in-out group-hover:-rotate-3',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var div_4 = $.first_child(fragment_2);
				var div_5 = $.child(div_4);
				var img_1 = $.child(div_5);

				$.set_attribute(img_1, 'src', BHIDE_SVELTE);
				$.reset(div_5);
				$.next(4);
				$.reset(div_4);

				var node_1 = $.sibling(div_4, 4);

				Signature(node_1, { class: 'mt-3 ml-8 size-5' });
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});

		var node_2 = $.sibling(node, 2);

		Card(node_2, {
			class: 'absolute -top-4 right-0 flex aspect-3/5 w-2/5 translate-y-4 p-2 transition-transform duration-200 ease-in-out group-hover:rotate-3',
			children: ($$anchor, $$slotProps) => {
				var div_6 = root_3();
				var node_3 = $.child(div_6);

				Play(node_3, {
					class: 'm-auto size-4 fill-foreground/50 stroke-foreground/50'
				});

				$.reset(div_6);
				$.append($$anchor, div_6);
			},
			$$slots: { default: true }
		});

		$.reset(div_3);
		$.append($$anchor, div_3);
	};

	const AIDEN_BLESER = "https://avatars.githubusercontent.com/u/117548273?v=4";
	const BHIDE_SVELTE = "https://avatars.githubusercontent.com/u/93428946?v=4";
	const RICH_HARRIS = "https://avatars.githubusercontent.com/u/1162160?v=4";
	const HUNTER_JOHNSTON = "https://avatars.githubusercontent.com/u/64506580?v=4";

	let avatars = [
		{ src: BHIDE_SVELTE, alt: "Bhide Svelte" },
		{ src: AIDEN_BLESER, alt: "Aiden Blesser" },
		{ src: RICH_HARRIS, alt: "Rich Harris" },
		{ src: HUNTER_JOHNSTON, alt: "Hunter Johnston" }
	];

	var section = root_10();
	var div_11 = $.child(section);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var node_8 = $.child(div_13);

	Card(node_8, {
		variant: 'soft',
		class: 'col-span-full overflow-hidden pt-6 pl-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_6();
			var node_9 = $.first_child(fragment_8);

			Layout(node_9, { class: 'size-5 text-primary' });
			$.next(6);
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 2);

	Card(node_10, {
		variant: 'soft',
		class: 'overflow-hidden p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_7();
			var node_11 = $.first_child(fragment_9);

			Target(node_11, { class: 'size-5 text-primary' });

			var node_12 = $.sibling(node_11, 6);

			MettingIllustration(node_12);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_10, 2);

	Card(node_13, {
		variant: 'soft',
		class: 'group overflow-hidden px-6 pt-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_8();
			var node_14 = $.first_child(fragment_10);

			CalendarCheck(node_14, { class: 'size-5 text-primary' });

			var node_15 = $.sibling(node_14, 6);

			CodeReviewIllustration(node_15);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_13, 2);

	Card(node_16, {
		variant: 'soft',
		class: 'group overflow-hidden px-6 pt-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_9();
			var node_17 = $.first_child(fragment_11);

			Sparkles(node_17, { class: 'size-5 text-primary' });

			var div_14 = $.sibling(node_17, 6);
			var node_18 = $.child(div_14);

			AIAssistantIllustration(node_18);
			$.reset(div_14);
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);
	$.reset(section);
	$.append($$anchor, section);
}