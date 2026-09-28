import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { category_blocks } from "$lib/all_blocks/category_block";
import { Button } from "$lib/components/ui/button";

var root = $.from_html(` <span class="rounded-xl border bg-secondary px-2 font-display"> </span>`, 1);
var root_1 = $.from_html(`<div><div class="mx-auto my-20 flex max-w-5xl flex-wrap items-center justify-center gap-2.5 px-4 md:px-8"></div></div>`);

export default function BlocksCards($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => category_blocks, $.index, ($$anchor, $$item) => {
		let title = () => $.get($$item).title;
		let href = () => $.get($$item).href;
		let length = () => $.get($$item).length;

		Button($$anchor, {
			get href() {
				return href();
			},
			size: 'extralg',
			variant: 'outline',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_1 = root();
				var text = $.first_child(fragment_1);
				var span = $.sibling(text);
				var text_1 = $.only_child(span, true);

				$.template_effect(() => {
					$.set_text(text, `${title() ?? ''} `);
					$.set_text(text_1, length());
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}