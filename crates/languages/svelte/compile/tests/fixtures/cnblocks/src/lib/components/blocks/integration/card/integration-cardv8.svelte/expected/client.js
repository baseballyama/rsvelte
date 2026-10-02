import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="space-y-4 rounded-lg border p-4 transition-colors hover:bg-muted dark:hover:bg-muted/50"><div class="flex size-fit items-center justify-center"><!></div> <div class="space-y-1"><h3 class="text-sm font-medium"> </h3> <p class="line-clamp-1 text-sm text-muted-foreground md:line-clamp-2"> </p></div></div>`);

export default function Integration_cardv8($$anchor, $$props) {
	let link = $.prop($$props, 'link', 3, "https://github.com/SikandarJODD/cnblocks");
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => $$props.icon, ($$anchor, Icon_1) => {
		Icon_1($$anchor, {});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var h3 = $.child(div_2);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.name);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
}