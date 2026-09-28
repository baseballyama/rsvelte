import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<figure class="shrink-0"><div class="overflow-hidden rounded-md"><img class="aspect-[3/4] h-fit w-fit object-cover"/></div> <figcaption class="pt-2 text-xs text-muted-foreground">Photo by <span class="font-semibold text-foreground"> </span></figcaption></figure>`);
var root_1 = $.from_html(`<div class="flex gap-4"></div>`);

export default function Scroll_area_horizontal($$anchor) {
	const works = [
		{
			artist: "Ornella Binni",
			art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80"
		},

		{
			artist: "Tom Byrom",
			art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80"
		},

		{
			artist: "Vladimir Malyav",
			art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80"
		}
	];

	Example($$anchor, {
		title: 'Horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
				ScrollArea_Root($$anchor, {
					orientation: 'horizontal',
					class: 'mx-auto w-full max-w-96 rounded-md border p-4 style-luma:rounded-2xl style-rhea:rounded-2xl',
					children: ($$anchor, $$slotProps) => {
						var div = root_1();

						$.each(div, 21, () => works, (artwork) => artwork.artist, ($$anchor, artwork) => {
							var figure = root();
							var div_1 = $.child(figure);
							var img = $.child(div_1);

							$.set_attribute(img, 'width', 300);
							$.set_attribute(img, 'height', 400);
							$.reset(div_1);

							var figcaption = $.sibling(div_1, 2);
							var span = $.sibling($.child(figcaption));
							var text = $.only_child(span, true);

							$.reset(figcaption);
							$.reset(figure);

							$.template_effect(() => {
								$.set_attribute(img, 'src', $.get(artwork).art);
								$.set_attribute(img, 'alt', `by ${$.get(artwork).artist ?? ''}`);
								$.set_text(text, $.get(artwork).artist);
							});

							$.append($$anchor, figure);
						});

						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}