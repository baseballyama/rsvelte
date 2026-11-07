import * as $ from 'svelte/internal/server';
import { forgot_password } from "$lib/all_blocks/forgot-password";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const block = forgot_password.find((item) => item.title === "two");

		if (!block) {
			throw new Error("Missing preview block for two in forgot_password");
		}

		const PreviewComponent = block.component;

		PreviewComponent($$renderer, {});
	});
}