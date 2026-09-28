import * as $ from 'svelte/internal/server';
import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Scroll_area_horizontal($$renderer) {
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

	Example($$renderer, {
		title: 'Horizontal',
		children: ($$renderer) => {
			if (ScrollArea.Root) {
				$$renderer.push('<!--[-->');

				ScrollArea.Root($$renderer, {
					orientation: 'horizontal',
					class: 'mx-auto w-full max-w-96 rounded-md border p-4 style-luma:rounded-2xl style-rhea:rounded-2xl',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex gap-4"><!--[-->`);

						const each_array = $.ensure_array_like(works);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let artwork = each_array[$$index];

							$$renderer.push(`<figure class="shrink-0"><div class="overflow-hidden rounded-md"><img${$.attr('src', artwork.art)}${$.attr('alt', `by ${$.stringify(artwork.artist)}`)} class="aspect-[3/4] h-fit w-fit object-cover"${$.attr('width', 300)}${$.attr('height', 400)}/></div> <figcaption class="pt-2 text-xs text-muted-foreground">Photo by <span class="font-semibold text-foreground">${$.escape(artwork.artist)}</span></figcaption></figure>`);
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}