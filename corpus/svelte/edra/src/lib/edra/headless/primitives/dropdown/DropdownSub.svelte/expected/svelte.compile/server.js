import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function DropdownSub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let open = false;
		let triggerEl = null;
		let contentEl = null;

		const subContext = {
			get open() {
				return open;
			},

			set open(val) {
				open = val;
			},

			get triggerEl() {
				return triggerEl;
			},

			set triggerEl(val) {
				triggerEl = val;
			},

			get contentEl() {
				return contentEl;
			},

			set contentEl(val) {
				contentEl = val;
			}
		};

		setContext('edra-dropdown-sub', subContext);
		$$renderer.push(`<div class="dropdown-sub svelte-15vxruo">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}