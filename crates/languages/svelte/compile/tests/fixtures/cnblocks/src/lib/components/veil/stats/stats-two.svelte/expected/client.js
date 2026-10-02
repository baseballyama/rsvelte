import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="relative h-full w-px rounded-full duration-200 before:absolute before:inset-0 before:-inset-x-6 after:absolute after:inset-0 after:mt-auto after:h-(--line-height) after:bg-foreground/15 hover:mx-2 hover:after:bg-primary"></div>`);

var root_1 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">Trusted by Teams Worldwide</h2> <p class="text-balance text-muted-foreground">Our platform delivers measurable results that help businesses scale faster and work
				smarter.</p></div> <div class="mt-12 grid grid-cols-2 gap-6 text-sm @xl:grid-cols-3"><div class="border-y py-6"><p class="text-xl text-muted-foreground"><span class="font-medium text-foreground">99.9%</span> Uptime guarantee.</p></div> <div class="border-y py-6"><p class="text-xl text-muted-foreground"><span class="font-medium text-foreground">10M+</span> API requests processed daily.</p></div> <div class="border-y py-6"><p class="text-xl text-muted-foreground"><span class="font-medium text-foreground">500+</span> Enterprise customers.</p></div></div></div> <div class="mx-auto flex h-72 max-w-5xl items-end justify-between gap-0.5 px-6"></div></section>`);

export default function Stats_two($$anchor) {
	var section = root_1();
	var div = $.sibling($.child(section), 2);

	$.set_attribute(div, 'aria-hidden', true);

	$.each(div, 20, () => ({ length: 48 }), $.index, ($$anchor, _, i) => {
		const progress = $.derived(() => i / 47);
		const base = $.derived(() => Math.pow($.get(progress), 2.2));
		const noise = $.derived(() => Math.sin(i * 0.7) * 0.08 + Math.sin(i * 1.3) * 0.05);
		const height = $.derived(() => Math.min(1, Math.max(0.05, $.get(base) + $.get(noise) * (0.3 + $.get(progress) * 0.7))));
		var div_1 = root();

		$.template_effect(() => $.set_style(div_1, `--line-height: ${$.get(height) * 100}%`));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}