import * as $ from 'svelte/internal/server';
import { usePopover } from '../modules/provider.svelte';
import { PopoverRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/popover';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			popoverProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const children = $.derived(() => componentProps().children);
		const popover = usePopover(() => ({ ...popoverProps(), id }));

		PopoverRootContext.provide(() => popover());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}