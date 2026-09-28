import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from '$lib/components/ui/badge';
import Button from '$lib/components/button.svelte';
import { UseFrecency } from '$lib/hooks/use-frecency.svelte';

var root = $.from_html(`<div class="flex flex-col gap-2"><div class="flex h-[120px] flex-col gap-2"></div> <div class="flex place-items-center gap-2"></div></div>`);

export default function Use_frecency($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ['Angular', 'Svelte', 'React', 'Vue'];
	const frecency = new UseFrecency('frecency-key');
	var div = root();
	var div_1 = $.child(div);

	$.each(div_1, 22, () => frecency.items, (item) => item, ($$anchor, item, i) => {
		Badge($$anchor, {
			variant: 'secondary',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(i) + 1}. ${item ?? ''}`));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 20, () => frameworks, (framework) => framework, ($$anchor, framework) => {
		Button($$anchor, {
			variant: 'outline',
			onclick: () => frecency.use(framework),
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, framework));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}