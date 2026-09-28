import * as $ from 'svelte/internal/server';
import Nested from "./Nested.svelte";
import Nested2 from "./Nested2.svelte";

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			inner: ($$renderer, { text }) => {
				Nested2($$renderer, {
					slot: 'inner',
					$$slots: {
						footer: ($$renderer) => {
							const text2 = text;

							$$renderer.push(`<div slot="footer">${$.escape(text)} ${$.escape(text2)}</div>`);
						}
					}
				});
			}
		}
	});
}