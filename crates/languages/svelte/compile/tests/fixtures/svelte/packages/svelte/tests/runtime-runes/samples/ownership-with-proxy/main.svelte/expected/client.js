import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, getContext } from "svelte";

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	setContext("", new Proxy({}, {
		get() {
			return {};
		}
	}));

	getContext("");
	$.pop();
}