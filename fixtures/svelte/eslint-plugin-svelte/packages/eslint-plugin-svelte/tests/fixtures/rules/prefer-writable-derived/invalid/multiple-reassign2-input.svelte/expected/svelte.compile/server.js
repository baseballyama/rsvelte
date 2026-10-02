import * as $ from 'svelte/internal/server';

export default function Multiple_reassign2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { albumName } = $$props;
		let newAlbumName = albumName;

		FooComponent($$renderer, {
			doSomething: (value) => {
				newAlbumName = value;
			}
		});
	});
}