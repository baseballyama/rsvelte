import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Preview from "../../components/preview.svelte";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	Preview($$anchor, {
		get item() {
			return $$props.data.params.item;
		}
	});

	$.pop();
}