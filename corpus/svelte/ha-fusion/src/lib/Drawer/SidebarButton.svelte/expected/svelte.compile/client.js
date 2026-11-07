import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dashboard, lang, ripple, record } from '$lib/Stores';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';
import { generateId } from '$lib/Utils';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button class="button dropdown"><figure class="svelte-sruxp5"><!></figure> </button>`);

export default function SidebarButton($$anchor, $$props) {
	$.push($$props, true);

	const $dashboard = () => $.store_get(dashboard, '$dashboard', $$stores);
	const $record = () => $.store_get(record, '$record', $$stores);
	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	/**
	 * Creates a new sidebar object in sidebar items
	 */
	function handleClick() {
		$.store_mutate(
			dashboard,
			$.untrack($dashboard).sidebar = [
				{ type: 'configure', id: generateId($dashboard()) },
				...$dashboard().sidebar
			],
			$.untrack($dashboard)
		);

		$record()();
		dispatch('clicked');
	}

	var button = root();
	var figure = $.child(button);
	var node = $.child(figure);

	Icon(node, {
		icon: 'solar:sidebar-minimalistic-bold-duotone',
		height: 'none'
	});

	$.reset(figure);

	var text = $.sibling(figure);

	$.reset(button);
	$.effect(() => $.event('click', button, handleClick));
	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), $ripple);
	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $lang()('sidebar')]);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}