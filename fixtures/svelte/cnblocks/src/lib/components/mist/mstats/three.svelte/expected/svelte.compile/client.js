import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from "@lucide/svelte/icons/arrow-right";

var root = $.from_html(`<li class="-ml-0.5 flex items-center gap-1.5"><!> <span class="font-medium text-foreground"> </span> </li>`);

var root_1 = $.from_html(`<section><div class="py-24"><div class="mx-auto max-w-5xl px-6"><div><h2 class="text-2xl font-semibold">Tailark in numbers</h2> <p class="mt-4 text-lg text-balance text-muted-foreground">Our platform continues to grow with developers and businesses using our tools to
					create innovative solutions and enhance productivity.</p></div> <ul role="list" class="mt-8 space-y-2 text-muted-foreground"></ul></div></div></section>`);

export default function Three($$anchor) {
	let stats = [
		{ value: "90+", label: "Integrations" },
		{ value: "56%", label: "Productivity Boost" },
		{ value: "24/7", label: "Customer Support" },
		{ value: "10k+", label: "Active Users" }
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var ul = $.sibling($.child(div_1), 2);

	$.each(ul, 21, () => stats, $.index, ($$anchor, stat) => {
		var li = root();
		var node = $.child(li);

		ArrowRight(node, { class: 'size-4 opacity-50' });

		var span = $.sibling(node, 2);
		var text = $.only_child(span, true);
		var text_1 = $.sibling(span);

		$.reset(li);

		$.template_effect(() => {
			$.set_text(text, $.get(stat).value);
			$.set_text(text_1, ` ${$.get(stat).label ?? ''}`);
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}