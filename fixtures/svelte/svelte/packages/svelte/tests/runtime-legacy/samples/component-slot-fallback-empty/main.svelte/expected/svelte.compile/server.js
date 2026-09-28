import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			bar: ($$renderer) => {
				$$renderer.push(`<input slot="bar"/>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Nested($$renderer, {});
	$$renderer.push(`<!---->`);
}