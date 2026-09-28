import * as $ from 'svelte/internal/server';
import { getters } from "$lib/utils/getters.svelte.js";
import { Avatar as Builder } from "../builders/Avatar.svelte";

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, onLoadingStatusChange, $$slots, $$events, ...rest } = $$props;
		const avatar = new Builder(getters({ ...rest }));

		children($$renderer, avatar);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { avatar });
	});
}