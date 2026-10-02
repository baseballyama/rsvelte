import * as $ from 'svelte/internal/server';

export default function Condition2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { albumName } = $$props;
		let newAlbumName = albumName;

		$$renderer.push(`<input${$.attr(
			'value',
			// In practice, this can be converted to $derived, but it’s difficult to detect in all cases.
			// So the rule doesn’t report it for now.
			newAlbumName
		)}/>`);
	});
}