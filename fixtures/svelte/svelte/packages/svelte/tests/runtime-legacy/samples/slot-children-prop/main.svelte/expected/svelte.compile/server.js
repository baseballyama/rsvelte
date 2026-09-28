import * as $ from 'svelte/internal/server';
import A from "./A.svelte";

export default function Main($$renderer) {
	A($$renderer, {
		children: 'foo',
		$$slots: {
			default: ($$renderer) => {
				$$renderer.push(`<!---->bar`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	A($$renderer, { children: 'foo' });
	$$renderer.push(`<!---->`);
}