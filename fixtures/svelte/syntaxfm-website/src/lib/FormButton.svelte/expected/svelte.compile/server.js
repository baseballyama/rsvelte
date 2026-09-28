import * as $ from 'svelte/internal/server';
import { enhance } from '$app/forms';
import { form_action } from './form_action';

export default function FormButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text, thinking_text, action_path, children } = $$props;
		let thinking = false;

		$$renderer.push(`<form${$.attr('action', action_path)} method="POST">`);
		children?.($$renderer);
		$$renderer.push(`<!----> <button${$.attr('disabled', thinking, true)} type="submit">${$.escape(thinking ? thinking_text : text)}</button></form>`);
	});
}