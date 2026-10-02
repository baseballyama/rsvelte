import * as $ from 'svelte/internal/server';
import { useMenu } from '../modules/provider.svelte';
import { MenuRootContext } from '../modules/root-context.js';
import { MenuTriggerItemContext } from '../modules/trigger-item-context.js';
import { splitProps } from '@zag-js/menu';
import { untrack } from 'svelte';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;
		const parentMenu = MenuRootContext.consume();

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			menuProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const children = $.derived(() => componentProps().children);
		const menu = useMenu(() => ({ ...menuProps(), id }));

		MenuRootContext.provide(() => menu());
		MenuTriggerItemContext.provide(() => parentMenu?.().getTriggerItemProps(menu()));
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}