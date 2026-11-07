import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";
import Child from "./child.svelte";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const attrs = writable({ count: 0 });

	Child($$anchor, {
		get attrs() {
			return attrs;
		}
	});

	$.pop();
}