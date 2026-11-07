import * as $ from 'svelte/internal/server';
import Navbar from "./Navbar.svelte";
import Sidebar from "./Sidebar.svelte";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	let drawerHidden = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<header class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">`);

		Navbar($$renderer, {
			get drawerHidden() {
				return drawerHidden;
			},

			set drawerHidden($$value) {
				drawerHidden = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></header> <div class="overflow-hidden lg:flex">`);

		Sidebar($$renderer, {
			get drawerHidden() {
				return drawerHidden;
			},

			set drawerHidden($$value) {
				drawerHidden = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="relative h-full w-full overflow-y-auto pt-[70px] lg:ml-64">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}