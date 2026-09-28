import * as $ from 'svelte/internal/server';
import { linkAccount } from '$lib/remote/auth/link-account.remote';

export default function Link_account_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			children,
			providerId,
			callbackURL,
			$$slots,
			$$events,
			...attributes
		} = $$props;

		$$renderer.push(`<form${$.attributes({ ...linkAccount.for(providerId) })}><input${$.attributes({ ...linkAccount.fields.providerId.as('hidden', providerId) }, void 0, void 0, void 0, 4)}/> `);

		if (callbackURL) {
			$$renderer.push(`<!--[0--><input${$.attributes({ ...linkAccount.fields.callbackURL.as('hidden', callbackURL) }, void 0, void 0, void 0, 4)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button${$.attributes({ ...attributes })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button></form>`);
	});
}