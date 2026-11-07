import * as $ from 'svelte/internal/server';
import { setContext, getContext } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext("", new Proxy({}, {
			get() {
				return {};
			}
		}));

		getContext("");
	});
}