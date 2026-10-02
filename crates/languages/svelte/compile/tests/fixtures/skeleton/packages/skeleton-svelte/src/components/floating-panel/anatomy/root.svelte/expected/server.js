import * as $ from 'svelte/internal/server';
import { useFloatingPanel } from '../modules/provider.svelte';
import { FloatingPanelRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/floating-panel';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			floatingPanelProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const children = $.derived(() => componentProps().children);
		const floatingPanel = useFloatingPanel(() => ({ ...floatingPanelProps(), id }));

		FloatingPanelRootContext.provide(() => floatingPanel());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}