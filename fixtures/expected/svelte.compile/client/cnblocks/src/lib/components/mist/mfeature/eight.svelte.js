import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/components/ui/card/card.svelte";
import Layout from "@lucide/svelte/icons/layout";
import Target from "@lucide/svelte/icons/target";
import CalendarCheck from "@lucide/svelte/icons/calendar-check";
import Sparkles from "@lucide/svelte/icons/sparkles";

var root = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">AI Code Generation</h3> <p class="mt-3 max-w-xl text-balance text-muted-foreground">Our advanced AI models transform natural language into production-ready
						code, streamlining development workflows and enabling faster iteration.</p> <div class="-mt-2 mr-0.5 -ml-2 mask-b-from-95% pt-2 pl-2"><div class="relative mx-auto mt-8 h-96 overflow-hidden rounded-tl-(--radius) border border-transparent bg-background shadow ring-1"><img src="/mist/tailark-3.png" alt="app screen" width="2880" height="1842" class="h-full object-cover object-top-left"/></div></div>`,
	1
);

var root_1 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">AI Code Generation</h3> <p class="mt-3 text-balance text-muted-foreground">Our advanced AI models transform natural language into production-ready
						code.</p>`,
	1
);

var root_2 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">Intelligent Code Review</h3> <p class="mt-3 text-balance text-muted-foreground">Our AI analyzes your code for bugs, security issues, and optimization
						opportunities.</p>`,
	1
);

var root_3 = $.from_html(
	`<!> <h3 class="mt-5 text-lg font-semibold text-foreground">Contextual AI Assistant</h3> <p class="mt-3 text-balance text-muted-foreground">A personalized AI companion that understands your codebase and helps solve
						complex...</p>`,
	1
);

var root_4 = $.from_html(`<section class="[--color-primary:theme(color.indigo.500)] [--color-secondary-foreground:theme(color.indigo.600)] [--color-secondary:theme(color.indigo.100)]"><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"><!> <!> <!> <!></div></div></div></section>`);

export default function Eight($$anchor) {
	var section = root_4();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Card(node, {
		variant: 'soft',
		class: 'col-span-full overflow-hidden pt-6 pl-6',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Layout(node_1, { class: 'size-5 text-primary' });
			$.next(6);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Card(node_2, {
		variant: 'soft',
		class: 'p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Target(node_3, { class: 'size-5 text-primary' });
			$.next(4);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Card(node_4, {
		variant: 'soft',
		class: 'p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_5 = $.first_child(fragment_2);

			CalendarCheck(node_5, { class: 'size-5 text-primary' });
			$.next(4);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Card(node_6, {
		variant: 'soft',
		class: 'p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_7 = $.first_child(fragment_3);

			Sparkles(node_7, { class: 'size-5 text-primary' });
			$.next(4);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}