import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { store } from "./store.svelte.js";

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	// This write marks the derived in main.svelte before it has reactions added to it.
	// This test checks that this does not cause the WAS_MARKED logic to incorrectly skip marking the derived subsequently.
	store.set("child-init-write", Math.random());

	$.pop();
}