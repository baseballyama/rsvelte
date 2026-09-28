import * as $ from 'svelte/internal/server';
import { DEV } from "esm-env";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (DEV) {
			throw new Error("Dev-only code must not run");
		}
	});
}