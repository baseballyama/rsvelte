import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Gallery } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/docs/gallery/square/image-1.jpg" alt="shoas" class="max-w- h-auto rounded-lg"/> <div class="max-w- flex h-auto items-center justify-center rounded-lg bg-red-300 text-6xl font-extrabold">Sale</div> <div class="max-w- flex h-auto items-center justify-center rounded-lg bg-blue-300 text-6xl font-extrabold">Sale</div> <img alt="plants" src="/images/docs/gallery/square/image-3.jpg" class="max-w- h-auto rounded-lg"/>`, 1);

export default function Heterogeneous($$anchor) {
	Gallery($$anchor, {
		class: 'grid-cols-2 gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(6);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}