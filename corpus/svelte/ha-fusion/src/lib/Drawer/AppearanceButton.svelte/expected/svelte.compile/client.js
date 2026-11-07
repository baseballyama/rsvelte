import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lang, ripple } from '$lib/Stores';
import { base } from '$app/paths';
import { openModal } from 'svelte-modals';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';

var root = $.from_html(`<button class="button"><figure><!></figure> <span> </span></button>`);

export default function AppearanceButton($$anchor, $$props) {
	$.push($$props, true);

	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let themes;

	/**
	 * Opens modal
	 */
	function handleClick() {
		openModal(() => import('$lib/Modal/AppearanceConfig.svelte'), { themes });
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Modal/AppearanceConfig.svelte');

		try {
			const response = await fetch(`${base}/_api/get_all_themes`);
			const data = await response.json();

			if (response.ok) {
				themes = data;
			} else {
				throw new Error(data.message);
			}
		} catch(error) {
			console.error(error);
		}
	}

	var button = root();
	var figure = $.child(button);

	$.set_style(figure, '', {}, { 'margin-right': '0.1rem' });

	var node = $.child(figure);

	Icon(node, {
		icon: 'material-symbols:invert-colors-rounded',
		height: 'none'
	});

	$.reset(figure);

	var span = $.sibling(figure, 2);
	var text = $.only_child(span, true);

	$.reset(button);
	$.effect(() => $.event('click', button, handleClick));
	$.effect(() => $.event('pointerenter', button, handlePointer));
	$.effect(() => $.event('pointerdown', button, handlePointer));
	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), $ripple);
	$.template_effect(($0) => $.set_text(text, $0), [() => $lang()('appearance')]);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}