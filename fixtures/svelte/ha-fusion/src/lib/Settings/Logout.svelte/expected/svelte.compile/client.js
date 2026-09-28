import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { openModal, closeModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import { lang, ripple } from '$lib/Stores';

var root = $.from_html(`<div class="svelte-panqhr"><span><h2> </h2> <p class="svelte-panqhr"> </p></span> <button class="action remove svelte-panqhr"> </button></div>`);

export default function Logout($$anchor, $$props) {
	$.push($$props, true);

	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function handleClick() {
		openModal(() => import('$lib/Modal/ConfirmAlert.svelte'), {
			title: $lang()('log_out'),
			message: $lang()('confirm_log_out'),
			confirm: async () => {
				localStorage.removeItem('hassTokens');
				location.reload();
			},

			cancel: () => {
				closeModal();
			}
		});
	}

	var div = root();
	var span = $.child(div);
	var h2 = $.child(span);
	var text = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(span);

	var button = $.sibling(span, 2);
	var text_2 = $.only_child(button, true);

	$.effect(() => $.event('click', button, $.preventDefault(handleClick)));
	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({ ...$ripple(), color: 'rgba(0, 0, 0, 0.35)' }));
	$.reset(div);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
		},
		[
			() => $lang()('log_out'),
			() => $lang()('auth'),
			() => $lang()('remove')
		]
	);

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}