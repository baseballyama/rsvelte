import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup, ToggleGroupItem } from "$lib/components/ui/toggle-group";
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import BoldIcon from "@lucide/svelte/icons/bold";
import Calendar1 from "@lucide/svelte/icons/calendar-1";
import Ellipsis from "@lucide/svelte/icons/ellipsis";
import Italic from "@lucide/svelte/icons/italic";
import Strikethrough from "@lucide/svelte/icons/strikethrough";
import Underline from "@lucide/svelte/icons/underline";

const ScheduleIllustation = ($$anchor, $$arg0) => {
	let _class = $.derived_safe_equal(() => $.fallback(($$arg0?.())._class, ""));
	let variant = $.derived_safe_equal(() => $.fallback(($$arg0?.()).variant, "elevated"));
	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		variant: 'mdefault',
		size: 'sm',
		class: 'rounded-sm',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Calendar1(node_1, { class: 'size-3' });
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	ToggleGroup(node_2, {
		type: 'multiple',
		size: 'sm',
		class: 'gap-0.5 *:rounded-md',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			ToggleGroupItem(node_3, {
				value: 'bold',
				'aria-label': 'Toggle bold',
				children: ($$anchor, $$slotProps) => {
					BoldIcon($$anchor, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			ToggleGroupItem(node_4, {
				value: 'italic',
				'aria-label': 'Toggle italic',
				children: ($$anchor, $$slotProps) => {
					Italic($$anchor, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			ToggleGroupItem(node_5, {
				value: 'underline',
				'aria-label': 'Toggle underline',
				children: ($$anchor, $$slotProps) => {
					Underline($$anchor, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			ToggleGroupItem(node_6, {
				value: 'strikethrough',
				'aria-label': 'Toggle strikethrough',
				children: ($$anchor, $$slotProps) => {
					Strikethrough($$anchor, { class: 'size-4' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_2, 4);

	Button(node_7, {
		size: 'icon',
		class: 'size-8',
		variant: 'ghost',
		children: ($$anchor, $$slotProps) => {
			Ellipsis($$anchor, { class: 'size-3' });
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
		},
		[
			() => $.clsx(cn("relative", $.get(_class))),
			() => $.clsx(cn("absolute flex -translate-x-1/8 -translate-y-[110%] items-center gap-2 rounded-lg bg-background p-1", {
				"shadow-black-950/10 shadow-lg": $.get(variant) === "elevated",
				"border border-foreground/10": $.get(variant) === "outlined",
				"border border-foreground/10 shadow-md shadow-black/5": $.get(variant) === "mixed"
			}))
		]
	);

	$.append($$anchor, div);
};

const CodeIllustration = ($$anchor, $$arg0) => {
	let _class = $.derived_safe_equal(() => $.fallback(($$arg0?.())._class, ""));
	var div_2 = root_4();
	var ul = $.child(div_2);

	$.each(ul, 20, () => ["Images", "Variables", "Pages", "Components", "Styles"], $.index, ($$anchor, item, index) => {
		var li = root_3();
		var text = $.only_child(li, true);

		$.template_effect(
			($0) => {
				$.set_class(li, 1, $0);
				$.set_text(text, item);
			},
			[
				() => $.clsx(cn(index == 2 && "text-foreground before:absolute before:-translate-x-[110%] before:text-orange-500 before:content-['Import']"))
			]
		);

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_2);

	$.template_effect(($0) => $.set_class(div_2, 1, $0), [
		() => $.clsx(cn("mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)]", $.get(_class)))
	]);

	$.append($$anchor, div_2);
};

var root = $.from_html(`<!> <span class="text-sm font-medium">Schedule</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><div><!> <span class="block h-4 w-px bg-border"></span> <!> <span class="block h-4 w-px bg-border"></span> <!></div> <span><span class="bg-secondary py-1 text-sm text-secondary-foreground dark:bg-secondary/10">Tomorrow 8:30 pm</span> is our priority.</span></div>`);
var root_3 = $.from_html(`<li> </li>`);
var root_4 = $.from_html(`<div><ul class="mx-auto w-fit font-mono text-2xl font-medium text-muted-foreground"></ul></div>`);

var root_5 = $.from_html(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)] dark:[--color-primary:theme(color.indigo.400)] dark:[--color-secondary-foreground:theme(color.indigo.500)] dark:[--color-secondary:theme(color.indigo.400)]"><div class="bg-muted/50 py-24"><div class="mx-auto w-full max-w-5xl px-6"><div><span class="text-primary">Smart Editor</span> <h2 class="mt-4 text-4xl font-semibold text-foreground">Ask Tailark to Edit anything</h2> <p class="mt-4 mb-12 text-lg text-muted-foreground">Efficient content creation is our mission. With Tailark, you can effortlessly
					edit text, generate code snippets, format documents, create visualizations from
					data, and seamlessly integrate with your existing workflow.</p></div> <div class="space-y-6 border-foreground/5 [--color-border:color-mix(in_oklab,var(--color-foreground)10%,transparent)] sm:space-y-0 sm:divide-y"><div class="grid sm:grid-cols-5"><!> <div class="mt-6 sm:col-span-3 sm:mt-0 sm:border-l sm:pl-12"><h3 class="text-xl font-semibold text-foreground">Marketing Campaigns</h3> <p class="mt-4 text-lg text-muted-foreground">We'll put together your schedule on automatically. You'll keep app
							deadlines, and will work on the highest priority items first.</p></div></div> <div class="grid sm:grid-cols-5"><div class="flex items-center justify-center pt-12 sm:col-span-2"><!></div> <div class="mt-6 sm:col-span-3 sm:mt-0 sm:border-l sm:pt-12 sm:pl-12"><h3 class="text-xl font-semibold text-foreground">AI Meeting Scheduler</h3> <p class="mt-4 text-lg text-muted-foreground">Ask the chat to create or update your events. Ask it how much time
							you've spent on demo calls last week. Or have it prepare today's
							agendas.</p></div></div></div></div></div></section>`);

export default function Two($$anchor, $$props) {
	$.push($$props, true);

	var section = root_5();
	var div_3 = $.child(section);
	var div_4 = $.child(div_3);
	var div_5 = $.sibling($.child(div_4), 2);
	var div_6 = $.child(div_5);
	var node_8 = $.child(div_6);

	CodeIllustration(node_8, () => ({ _class: "sm:col-span-2" }));
	$.next(2);
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.child(div_7);
	var node_9 = $.child(div_8);

	ScheduleIllustation(node_9, () => ({ _class: "pt-8" }));
	$.reset(div_8);
	$.next(2);
	$.reset(div_7);
	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}