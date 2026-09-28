import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';
import LoadingIndicator from '../LoadingIndicator.svelte';
import Icon from '../Icon.svelte';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			showBackButton = false,
			isLoading = false,
			onPopView,
			children,
			actions
		} = $$props;

		const handleKeydown = (event) => {
			if (event.key === 'Escape' && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey) {
				if (event.target instanceof HTMLElement && event.target.closest('[data-dropdown-menu-content]')) {
					// the user has a dropdown open, we want to close the dropdown instead of going back
					return;
				}

				if (onPopView) {
					event.preventDefault();
					onPopView();
				}
			}
		};

		$$renderer.push(`<header class="relative flex h-15 shrink-0 items-center border-b pr-4 pl-[18px]">`);

		if (showBackButton) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				size: 'icon',
				onclick: onPopView,
				variant: 'secondary',
				class: 'size-6',
				children: ($$renderer) => {
					Icon($$renderer, { icon: 'arrow-left-16' });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex flex-grow items-center">`);
		children($$renderer);
		$$renderer.push(`<!----></div> `);

		if (actions) {
			$$renderer.push(`<!--[0--><div class="ml-2 flex items-center">`);
			actions($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		LoadingIndicator($$renderer, { isLoading });
		$$renderer.push(`<!----></header>`);
	});
}