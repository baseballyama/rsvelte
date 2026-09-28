import * as $ from 'svelte/internal/server';

export default function FacePile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { size = '50px', faces = [] } = $$props;

		$$renderer.push(`<div class="pile svelte-1gjzk3q"${$.attr_style('', { '--face-size': size, '--face-count': faces.length })}><!--[-->`);

		const each_array = $.ensure_array_like(faces);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let face = each_array[$$index];

			$$renderer.push(`<img${$.attr('src', `https://github.com/${$.stringify(face.github || 'null')}.png`)}${$.attr('alt', face.name)} class="svelte-1gjzk3q"/>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}