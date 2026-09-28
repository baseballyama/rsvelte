import * as $ from 'svelte/internal/server';

export default function BurgerIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showMenu = false } = $$props;
		let text = $.derived(() => showMenu ? 'Hide' : 'Show');

		$$renderer.push(`<button${$.attr('aria-label', `${text()} navigation menu`)}${$.attr('aria-expanded', showMenu)}>`);

		if (showMenu) {
			$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`);
		}

		$$renderer.push(`<!--]--></button>`);
		$.bind_props($$props, { showMenu });
	});
}