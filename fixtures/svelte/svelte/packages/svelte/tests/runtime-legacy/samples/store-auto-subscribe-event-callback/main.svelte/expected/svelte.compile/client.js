import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<input class="input" type="text" placeholder="Type here"/> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $validity = () => $.store_get(validity, '$validity', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function createValidator() {
		const { subscribe, set } = writable({ dirty: false, valid: false });

		function action(node, binding) {
			return {
				update(value) {
					set({ dirty: true, valid: value !== '' });
				}
			};
		}

		return [{ subscribe }, action];
	}

	const [validity, validate] = createValidator();
	let email = null;
	var $$exports = { createValidator };
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	$.effect(() => $.bind_value(input, () => email, ($$value) => email = $$value));
	$.action(input, ($$node, $$action_arg) => validate?.($$node, $$action_arg), () => email);

	var text = $.sibling(input);

	$.template_effect(() => $.set_text(text, ` Dirty: ${$validity().dirty ?? ''}
Valid: ${$validity().valid ?? ''}`));

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}