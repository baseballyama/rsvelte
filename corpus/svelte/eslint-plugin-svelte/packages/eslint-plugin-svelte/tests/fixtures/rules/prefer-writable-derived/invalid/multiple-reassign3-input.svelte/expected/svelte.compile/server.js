import * as $ from 'svelte/internal/server';

export default function Multiple_reassign3_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { albumName } = $$props;
		let newAlbumName = albumName;

		$$renderer.push(`<input${$.attr('value', newAlbumName)}/>`);
	});
}