import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Body($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", children } = $$props;
		const rootState = getContext("modal");

		let bodyClass = $.derived(() => {
			if (rootState.sticky) {
				return "";
			} else {
				return "";
			}
		});

		if (children) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`relative h-full ${$.stringify(bodyClass())} ${$.stringify(klass)}`, 'svelte-1r576r1')}>`);

			if (rootState.sticky) {
				$$renderer.push(`<!--[0--><div aria-hidden="true" class="h-18.25 w-full"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="modal-body overflow-y-auto overscroll-contain scroll-smooth p-6 svelte-1r576r1">`);
			children($$renderer);
			$$renderer.push(`<!----></div> <div aria-hidden="true" class="w-full lg:h-18.25"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}