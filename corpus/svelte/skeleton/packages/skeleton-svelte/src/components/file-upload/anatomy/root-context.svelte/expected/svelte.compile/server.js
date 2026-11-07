import * as $ from 'svelte/internal/server';
import { FileUploadRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const fileUpload = FileUploadRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, fileUpload);
		$$renderer.push(`<!---->`);
	});
}