import * as $ from 'svelte/internal/server';
import Footer from "../(no-sidebar)/Footer.svelte";
import Navbar from "../(sidebar)/Navbar.svelte";

export default function _layout($$renderer, $$props) {
	// import '../../app.css';
	let { children } = $$props;

	$$renderer.push(`<header class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">`);
	Navbar($$renderer, {});
	$$renderer.push(`<!----></header> <div class="mx-auto max-w-screen-2xl pt-[70px]">`);
	children($$renderer);
	$$renderer.push(`<!----> `);
	Footer($$renderer, {});
	$$renderer.push(`<!----></div>`);
}