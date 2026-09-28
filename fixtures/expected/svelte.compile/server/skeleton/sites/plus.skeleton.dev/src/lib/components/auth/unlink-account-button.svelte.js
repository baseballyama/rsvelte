import * as $ from 'svelte/internal/server';
import { unlinkAccount } from '$lib/remote/auth/unlink-account.remote';

export default function Unlink_account_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, providerId, $$slots, $$events, ...attributes } = $$props;

		$$renderer.push(`<form${$.attributes({ ...unlinkAccount.for(providerId) })}><input${$.attributes({ ...unlinkAccount.fields.providerId.as('hidden', providerId) }, void 0, void 0, void 0, 4)}/> <button${$.attributes({ ...attributes })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button></form>`);
	});
}