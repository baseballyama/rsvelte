import * as $ from 'svelte/internal/server';
import { SvelteDate } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let date = new SvelteDate('2024-02-23T15:00:00Z');

		$$renderer.push(`<div>getSeconds: ${$.escape(date.getUTCSeconds())}</div> <div>getMinutes: ${$.escape(date.getUTCMinutes())}</div> <div>getHours: ${$.escape(date.getUTCHours())}</div> <div>getTime: ${$.escape(date.getTime())}</div> <div>toUTCString: ${$.escape(date.toUTCString())}</div> <button>1 second</button> <button>1 minute</button> <button>1 hour</button>`);
	});
}