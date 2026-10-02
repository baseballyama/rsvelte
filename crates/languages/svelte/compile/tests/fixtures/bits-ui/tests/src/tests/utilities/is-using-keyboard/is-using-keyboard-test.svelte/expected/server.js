import * as $ from 'svelte/internal/server';
import { IsUsingKeyboard } from "bits-ui";

export default function Is_using_keyboard_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const isUsingKeyboard = new IsUsingKeyboard();

		$.bind_props($$props, { isUsingKeyboard });
	});
}