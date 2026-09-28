import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";
import Nested2 from "./Nested2.svelte";

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			inner: ($$renderer, { text }) => {
				Nested2($$renderer, {
					slot: 'inner',
					text,
					$$slots: {
						footer: ($$renderer) => {
							$$renderer.push(`<div slot="footer">${$.escape(text)}</div>`);
						}
					}
				});
			}
		}
	});
}