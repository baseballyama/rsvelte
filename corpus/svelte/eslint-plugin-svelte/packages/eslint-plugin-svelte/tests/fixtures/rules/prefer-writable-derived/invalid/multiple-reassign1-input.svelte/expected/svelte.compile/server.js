import * as $ from 'svelte/internal/server';

export default function Multiple_reassign1_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { albumName } = $$props;
		let newAlbumName = albumName;

		setInterval(
			() => {
				newAlbumName = albumName + albumName;
			},
			1000
		);

		$$renderer.push(`<input${$.attr('value', newAlbumName)}/>`);
	});
}