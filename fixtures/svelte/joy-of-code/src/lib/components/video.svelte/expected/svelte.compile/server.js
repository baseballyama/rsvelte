import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Video($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { src } = $$props;
		const images = `https://raw.githubusercontent.com/mattcroat/joy-of-code/main/posts`;
		const slug = page.params.slug;

		$$renderer.push(`<video controls=""><source${$.attr('src', `https://raw.githubusercontent.com/mattcroat/joy-of-code/main/posts/${$.stringify(slug)}/images/${$.stringify(src)}`)} type="video/mp4"/></video>`);
	});
}