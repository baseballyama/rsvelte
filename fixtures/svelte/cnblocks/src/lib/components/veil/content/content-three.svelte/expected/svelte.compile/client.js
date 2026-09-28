import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Lightbulb from "@lucide/svelte/icons/lightbulb";
import Pencil from "@lucide/svelte/icons/pencil";
import PencilRuler from "@lucide/svelte/icons/pencil-ruler";

var root = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div class="space-y-4"><h2 class="font-serif text-4xl font-medium text-balance">Create Content with AI Assistance</h2> <p class="text-muted-foreground">Our AI assistant helps you create better content faster. Generate ideas, improve
				your writing, and design layouts with simple prompts.</p></div> <div class="mt-12 grid grid-cols-2 gap-6 text-sm @xl:grid-cols-3"><div class="space-y-3 border-t pt-6"><!> <p class="leading-5 text-muted-foreground"><span class="font-medium text-foreground">Generate Ideas</span> Spark creativity with
					AI-powered content suggestions and inspiration.</p></div> <div class="space-y-3 border-t pt-6"><!> <p class="leading-5 text-muted-foreground"><span class="font-medium text-foreground">Improve Writing</span> Enhance your text
					with smart editing suggestions and style refinements.</p></div> <div class="space-y-3 border-t pt-6"><!> <p class="leading-5 text-muted-foreground"><span class="font-medium text-foreground">Design Layouts</span> Create visually appealing
					layouts that capture your audience's attention.</p></div></div></div></section>`);

export default function Content_three($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Lightbulb(node, { class: 'size-4 text-muted-foreground' });
	$.next(2);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Pencil(node_1, { class: 'size-4 text-muted-foreground' });
	$.next(2);
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	PencilRuler(node_2, { class: 'size-4 text-muted-foreground' });
	$.next(2);
	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}