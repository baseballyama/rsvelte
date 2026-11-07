import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			slot1: ($$renderer) => {
				$$renderer.push(`<input slot="slot1"/>`);
			}
		}
	});
}