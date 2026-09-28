import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resource } from "runed";
import { DemoContainer, Button, Input } from "@svecodocs/kit";

var root = $.from_html(`<div class="text-destructive text-sm"> </div>`);
var root_1 = $.from_html(`<pre> </pre>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2 text-nowrap">Post id: <!></div> <div class="bg-card text-card-foreground rounded-md border p-4"><div class="flex w-full flex-col gap-2 overflow-hidden"><div class="text-muted-foreground text-sm"> </div> <!> <div class="flex w-[400px] flex-col gap-1 overflow-scroll"></div></div></div> <!>`, 1);

export default function Resource($$anchor, $$props) {
	$.push($$props, true);

	let id = $.state(1);

	const searchResource = resource(
		() => $.get(id),
		async (id) => {
			const response = await fetch(`https://jsonplaceholder.typicode.com/posts?id=${id}`);

			return response.json();
		},
		{ debounce: 1000 }
	);

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node = $.sibling($.child(div));

			Input(node, {
				type: 'number',
				placeholder: 'Type to search...',
				class: 'w-full',
				get value() {
					return $.get(id);
				},

				set value($$value) {
					$.set(id, $$value, true);
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var text = $.only_child(div_3);
			var node_1 = $.sibling(div_3, 2);

			{
				var consequent = ($$anchor) => {
					var div_4 = root();
					var text_1 = $.only_child(div_4);

					$.template_effect(() => $.set_text(text_1, `Error: ${searchResource.error.message ?? ''}`));
					$.append($$anchor, div_4);
				};

				$.if(node_1, ($$render) => {
					if (searchResource.error) $$render(consequent);
				});
			}

			var div_5 = $.sibling(node_1, 2);

			$.each(div_5, 23, () => searchResource.current ?? [], (result, i) => `result-${i}`, ($$anchor, result) => {
				var pre = root_1();
				var text_2 = $.only_child(pre, true);

				$.template_effect(($0) => $.set_text(text_2, $0), [() => JSON.stringify($.get(result), null, 2)]);
				$.append($$anchor, pre);
			});

			$.reset(div_5);
			$.reset(div_2);
			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			Button(node_2, {
				onclick: () => searchResource.refetch(),
				get disabled() {
					return searchResource.loading;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Refetch Results');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, `Status: ${searchResource.loading ? "Loading..." : "Ready"}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}