import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<figure class="svelte-1cah974"><img class="svelte-1cah974"/> <figcaption> </figcaption></figure>`);
var root_1 = $.from_html(`<p>loading...</p>`);
var root_2 = $.from_html(`<h1>Photo album</h1> <div class="photos svelte-1cah974"></div>`, 1);

export default function Onmount_input($$anchor, $$props) {
	$.push($$props, true);

	let photos = [];

	onMount(async () => {
		const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);

		photos = await res.json();
	});

	var fragment = root_2();
	var div = $.sibling($.first_child(fragment), 2);

	$.each(
		div,
		21,
		() => photos,
		$.index,
		($$anchor, photo) => {
			var figure = root();
			var img = $.child(figure);
			var figcaption = $.sibling(img, 2);
			var text = $.only_child(figcaption, true);

			$.reset(figure);

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(photo).thumbnailUrl);
				$.set_attribute(img, 'alt', $.get(photo).title);
				$.set_text(text, $.get(photo).title);
			});

			$.append($$anchor, figure);
		},
		($$anchor) => {
			var p = root_1();

			$.append($$anchor, p);
		}
	);

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}