import * as $ from 'svelte/internal/server';

function figure($$renderer, image) {
	$$renderer.push(`<figure><img${$.attr('src', image.src)}${$.attr('alt', image.caption)}${$.attr('width', image.width)}${$.attr('height', image.height)}/> <figcaption>${$.escape(image.caption)}</figcaption></figure>`);
}

export default function _1_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(images);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let image = each_array[$$index];

		if (image.href) {
			$$renderer.push(`<!--[0--><a${$.attr('href', image.href)}>`);
			figure($$renderer, image);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
			figure($$renderer, image);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}