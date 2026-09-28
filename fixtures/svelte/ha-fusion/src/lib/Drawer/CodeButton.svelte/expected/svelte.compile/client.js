import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lang, ripple } from '$lib/Stores';
import { openModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';

var root = $.from_html(`<button class="button"><figure><!></figure> <span class="svelte-1lcp3iu"> </span></button>`);

export default function CodeButton($$anchor, $$props) {
	$.push($$props, true);

	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * Opens modal
	 */
	function handleClick() {
		openModal(() => import('$lib/Modal/CodeConfig.svelte'));
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Modal/CodeConfig.svelte');
	}

	var button = root();
	var figure = $.child(button);
	var node = $.child(figure);

	Icon(node, { icon: 'ph:code-bold', height: 'none' });
	$.reset(figure);

	var span = $.sibling(figure, 2);
	var text = $.only_child(span, true);

	$.reset(button);
	$.effect(() => $.event('click', button, handleClick));
	$.effect(() => $.event('pointerenter', button, handlePointer));
	$.effect(() => $.event('pointerdown', button, handlePointer));
	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), $ripple);
	$.template_effect(($0) => $.set_text(text, $0), [() => $lang()('code')]);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}