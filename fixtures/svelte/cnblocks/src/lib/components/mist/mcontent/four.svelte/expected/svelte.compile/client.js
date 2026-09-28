import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from "@lucide/svelte/icons/arrow-right";

var root = $.from_html(`<li class="-ml-0.5 flex items-center gap-1.5"><!> <span class="font-medium text-foreground"> </span> </li>`);

var root_1 = $.from_html(`<section><div class="py-24"><div class="mx-auto w-full max-w-5xl px-6"><div class="@container mx-auto max-w-2xl"><div><h2 class="text-4xl font-semibold text-foreground">Create Content with AI Assistance</h2> <p class="mt-4 mb-12 text-xl text-muted-foreground">Our AI assistant helps you create better content faster. Generate ideas,
						improve your writing, and design layouts with simple prompts.</p></div> <div class="my-12 grid gap-6 @sm:grid-cols-2 @2xl:grid-cols-3"><div class="space-y-2"><span class="mb-4 block text-3xl">💡</span> <h3 class="text-xl font-medium">Generate Ideas</h3> <p class="text-muted-foreground">Spark creativity with AI-powered content suggestions and inspiration.</p></div> <div class="space-y-2"><span class="mb-4 block text-3xl">✏️</span> <h3 class="text-xl font-medium">Improve Writing</h3> <p class="text-muted-foreground">Enhance your text with smart editing suggestions and style refinements.</p></div> <div class="space-y-2"><span class="mb-4 block text-3xl">🎨</span> <h3 class="text-xl font-medium">Design Layouts</h3> <p class="text-muted-foreground">Create visually appealing layouts that capture your audience's
							attention.</p></div></div> <div class="border-t"><ul role="list" class="mt-8 space-y-2 text-muted-foreground"></ul></div></div></div></div></section>`);

export default function Four($$anchor) {
	let content = [
		{ value: "90+", label: "Integrations" },
		{ value: "56%", label: "Productivity Boost" },
		{ value: "24/7", label: "Customer Support" },
		{ value: "10k+", label: "Active Users" }
	];

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 4);
	var ul = $.child(div_3);

	$.each(ul, 21, () => content, $.index, ($$anchor, stat) => {
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
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}