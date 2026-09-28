import * as $ from 'svelte/internal/server';
import { signOut } from '$lib/remote/auth/sign-out.remote';

export default function Sign_out_button($$renderer, $$props) {
	const { children, $$slots, $$events, ...attributes } = $$props;

	$$renderer.push(`<form${$.attributes({ ...signOut })}><button${$.attributes({ ...attributes })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></button></form>`);
}