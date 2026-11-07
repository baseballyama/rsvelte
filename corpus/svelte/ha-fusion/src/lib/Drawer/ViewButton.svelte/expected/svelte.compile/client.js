import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dashboard, lang, ripple, record } from '$lib/Stores';
import { createEventDispatcher, tick } from 'svelte';
import Ripple from 'svelte-ripple';
import Icon from '@iconify/svelte';
import { generateId } from '$lib/Utils';

var root = $.from_html(`<button class="button dropdown"><figure><!></figure> </button>`);

export default function ViewButton($$anchor, $$props) {
	$.push($$props, true);

	const $lang = () => $.store_get(lang, '$lang', $$stores);
	const $dashboard = () => $.store_get(dashboard, '$dashboard', $$stores);
	const $record = () => $.store_get(record, '$record', $$stores);
	const $ripple = () => $.store_get(ripple, '$ripple', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	/**
	 * Adds a new view to `$dashboard`
	 */
	async function handleClick() {
		// if a view with the default name "Overview" already exists
		// append an increasing number to the name e.g. "Overview 2"
		const placeholder = $lang()('overview');

		const id = generateId($dashboard());
		let count = 1;
		let name = placeholder;

		while ($dashboard().views.find((view) => view.name === name)) {
			count += 1;
			name = `${placeholder} ${count}`;
		}

		// prepend view
		$.store_mutate(dashboard, $.untrack($dashboard).views = [{ name, id, sections: [] }, ...$dashboard().views], $.untrack($dashboard));

		$record()();

		// click new view
		await tick();

		const button = document.getElementById(String(id));

		if (button) {
			button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
			button.click();
		}

		dispatch('clicked');
	}

	var button_1 = root();
	var figure = $.child(button_1);

	$.set_style(figure, '', {}, { width: '1.35rem' });

	var node = $.child(figure);

	Icon(node, { icon: 'fluent:tab-add-24-filled', height: 'none' });
	$.reset(figure);

	var text = $.sibling(figure);

	$.reset(button_1);
	$.effect(() => $.event('click', button_1, handleClick));
	$.action(button_1, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), $ripple);
	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $lang()('add_view')]);
	$.append($$anchor, button_1);
	$.pop();
	$$cleanup();
}