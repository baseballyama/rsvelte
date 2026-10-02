import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="text-center"><p class="text-xl text-balance text-foreground">Tailark has been a game-changer for our team. It has helped us to build a modern and
				scalable web application.</p> <div class="mt-8 flex flex-col items-center justify-center gap-3"><div class="relative size-10 shrink-0 rounded-full before:absolute before:inset-0 before:rounded-full before:border before:border-foreground/10"><img src="https://avatars.githubusercontent.com/u/68236786?v=4" alt="Theo Balick" class="rounded-full object-cover"/></div> <div class="space-y-0.5"><p class="text-sm font-medium text-foreground">Théo Balick</p> <p class="text-xs text-muted-foreground">Founder, CEO - Acme</p></div></div></div></div></section>`);

export default function Testimonial_four($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var img = $.child(div_3);

	$.set_attribute(img, 'width', 40);
	$.set_attribute(img, 'height', 40);
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}