import * as $ from 'svelte/internal/server';
import { MenuRootContext } from '../modules/root-context.js';
import { MenuTriggerItemContext } from '../modules/trigger-item-context.js';
import { untrack } from 'svelte';

export default function Root_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const parentMenu = MenuRootContext.consume();

		const children = $.derived(() => props.children),
			menu = $.derived(() => props.value);

		MenuRootContext.provide(() => menu()());
		MenuTriggerItemContext.provide(() => parentMenu?.().getTriggerItemProps(menu()()));
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}