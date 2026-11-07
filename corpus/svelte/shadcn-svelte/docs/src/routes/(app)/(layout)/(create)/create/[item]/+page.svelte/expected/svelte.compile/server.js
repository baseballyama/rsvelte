import * as $ from 'svelte/internal/server';
import Preview from "../../components/preview.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		Preview($$renderer, { item: data.params.item });
	});
}