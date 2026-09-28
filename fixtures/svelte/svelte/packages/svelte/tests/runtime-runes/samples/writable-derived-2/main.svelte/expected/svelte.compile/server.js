import * as $ from 'svelte/internal/server';
import { expect2, createAppState } from "./util.svelte.js";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const result = createAppState({ source: () => "wrong" });

		result.onChange("right");

		const expect1 = result.value === "right";

		$$renderer.push(`<!---->${$.escape(expect1)} ${$.escape(expect2)}`);
	});
}