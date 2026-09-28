import * as $ from 'svelte/internal/server';
import { setComponentDialogCtx } from './component-dialog-context.svelte';

export default function Component_dialog_context_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		setComponentDialogCtx({});
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}