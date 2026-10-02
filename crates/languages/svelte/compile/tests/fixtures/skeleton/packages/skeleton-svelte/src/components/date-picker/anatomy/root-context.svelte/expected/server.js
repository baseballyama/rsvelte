import * as $ from 'svelte/internal/server';
import { DatePickerRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const datePicker = DatePickerRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, datePicker);
		$$renderer.push(`<!---->`);
	});
}