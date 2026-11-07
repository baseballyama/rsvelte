import * as $ from 'svelte/internal/server';
import { dispatch } from '@smui/common/internal';
import Button from '@smui/button';

export default function _Dispatch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let target;
		let event = false;

		function dispatchEvent() {
			dispatch(
				target,
				'MyEvent',
				{
					// This is the event.details object.
					time: new Date().toLocaleTimeString()
				},
				{
					// This is the eventInit object.
					bubbles: true, // this is the default when no eventInit object is provided.
					cancelable: true // you can make it cancelable like this.
				}
			);
		}

		$$renderer.push(`<div class="event svelte-1fiqzkp">I'm the event listener. <div class="event svelte-1fiqzkp"><div class="event svelte-1fiqzkp"><div class="event svelte-1fiqzkp">I'm the event target.</div></div></div></div> <br/> `);

		Button($$renderer, {
			onclick: dispatchEvent,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dispatch Event`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Caught Event Detail: ${$.escape(event && JSON.stringify(event.detail))}</pre>`);
	});
}