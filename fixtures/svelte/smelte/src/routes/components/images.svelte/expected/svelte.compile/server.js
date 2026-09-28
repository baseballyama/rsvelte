import * as $ from 'svelte/internal/server';
import Image from "components/Image";
import Code from "docs/Code.svelte";
import images from "examples/images.txt";

export default function Images($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const range = [...new Array(50)];

		$$renderer.push(`<p>Smelte includes convenience image component which is useful for lazyloading, but generally we recommend
  using <a class="a" href="https://github.com/matyunya/svelte-image">Svelte Image</a>.</p> `);

		Code($$renderer, { code: images });
		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(range);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let _ = each_array[i];

			$$renderer.push(`<div class="my-8">`);

			Image($$renderer, {
				src: `https://placeimg.com/${$.stringify(400 + i)}/${$.stringify(300 + i)}/animals`,
				alt: `Kitty ${$.stringify(i)}`,
				height: 400 + 1,
				width: 300 + 1
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}