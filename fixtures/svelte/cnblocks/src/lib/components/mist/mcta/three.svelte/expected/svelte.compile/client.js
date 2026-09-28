import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Calendar from "@lucide/svelte/icons/calendar";

var root = $.from_html(`Try Mist for Free <!>`, 1);
var root_1 = $.from_html(`<!> Request a Demo`, 1);
var root_2 = $.from_html(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="bg-muted/50 py-12 dark:bg-muted/30"><div class="mx-auto max-w-5xl px-6"><h2 class="max-w-lg text-3xl font-semibold text-balance text-foreground lg:text-4xl"><span class="text-muted-foreground">Build Modern Websites.</span> Drive Results</h2> <p class="mt-4 text-lg">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p> <div class="mt-8 flex gap-3"><!> <!></div></div></div></section>`);

export default function Three($$anchor) {
	var section = root_2();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var node = $.child(div_2);

	Button(node, {
		variant: 'mdefault',
		href: '/',
		class: 'pr-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			ChevronRight(node_1, { strokeWidth: 2.5, class: 'size-3.5! opacity-50' });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		href: '/',
		variant: 'outline',
		class: 'pl-2.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			Calendar(node_3, { class: '!size-3.5 opacity-50', strokeWidth: 2.5 });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}