import * as $ from 'svelte/internal/server';
import { setup } from './utils.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let tmp = setup(), num = tmp.num;
		let tmp_1 = setup(), num_frozen = tmp_1.num;

		$$renderer.push(`<button>${$.escape(num)} / ${$.escape(num_frozen)}</button>`);
	});
}