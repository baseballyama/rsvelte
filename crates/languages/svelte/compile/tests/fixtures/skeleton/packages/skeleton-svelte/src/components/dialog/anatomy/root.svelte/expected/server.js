import * as $ from 'svelte/internal/server';
import { useDialog } from '../modules/provider.svelte';
import { DialogRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/dialog';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			dialogProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const children = $.derived(() => componentProps().children);
		const dialog = useDialog(() => ({ ...dialogProps(), id }));

		DialogRootContext.provide(() => dialog());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}