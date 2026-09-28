import * as $ from 'svelte/internal/server';
import { beforeNavigate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let before_navigate_ran = false;

		beforeNavigate(() => {
			before_navigate_ran = true;
		});

		$$renderer.push(`<h1>before_navigate_ran: ${$.escape(before_navigate_ran)}</h1> <a href="#x">x</a>`);
	});
}