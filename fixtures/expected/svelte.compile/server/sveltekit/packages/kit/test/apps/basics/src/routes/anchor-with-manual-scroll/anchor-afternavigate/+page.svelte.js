import * as $ from 'svelte/internal/server';
import { afterNavigate, disableScrollHandling } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		afterNavigate(() => {
			disableScrollHandling();
			document.getElementById('abcde')?.scrollIntoView();
		});

		$$renderer.push(`<div style="height: 180vh; background-color: hotpink;">They (don't) see me...</div> <div style="height: 180vh; background-color: peru;"><p id="go-to-element">The browser scrolls to me</p></div> <p id="abcde" style="height: 180vh; background-color: hotpink;">I take precedence</p> <div></div> <a href="/anchor-with-manual-scroll/anchor-afternavigate?x=y#go-to-element">reload me</a>`);
	});
}