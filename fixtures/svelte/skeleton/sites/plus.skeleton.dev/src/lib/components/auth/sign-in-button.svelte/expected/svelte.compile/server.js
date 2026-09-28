import * as $ from 'svelte/internal/server';
import { signIn } from '$lib/remote/auth/sign-in.remote';

export default function Sign_in_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, providerId, $$slots, $$events, ...attributes } = $$props;

		$$renderer.push(`<form${$.attributes({ ...signIn.for(providerId) })}><input${$.attributes({ ...signIn.fields.providerId.as('hidden', providerId) }, void 0, void 0, void 0, 4)}/> <button${$.attributes({ ...attributes })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button></form>`);
	});
}