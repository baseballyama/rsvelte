import * as $ from 'svelte/internal/server';
import MyComponent from './_UseActionsComponent.svelte';
import Pannable from './_UseActionsPannable';
import Swipeable from './_UseActionsSwipeable';
import Tappable from './_UseActionsTappable';

export default function _UseActions($$renderer) {
	$$renderer.push(`<div class="container svelte-15r9h79">`);

	MyComponent($$renderer, {
		use: [
			Pannable,
			Swipeable,
			[
				Tappable,
				{
					bgColor: 'var(--mdc-theme-secondary)',
					color: 'var(--mdc-theme-on-secondary)'
				}
			]
		],

		children: ($$renderer) => {
			$$renderer.push(`<!---->Swipe me.<br/> Tap me.<br/> Press me.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}