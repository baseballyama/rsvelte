import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IsUsingKeyboard } from "bits-ui";

export default function Is_using_keyboard_test($$anchor, $$props) {
	$.push($$props, true);

	const isUsingKeyboard = new IsUsingKeyboard();
	var $$exports = { isUsingKeyboard };

	return $.pop($$exports);
}