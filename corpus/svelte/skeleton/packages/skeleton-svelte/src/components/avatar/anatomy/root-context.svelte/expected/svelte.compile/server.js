import * as $ from 'svelte/internal/server';
import { AvatarRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const avatar = AvatarRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, avatar);
		$$renderer.push(`<!---->`);
	});
}