import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutDialog } from '$/actions/click_outside_dialog';
import { episode_share_status } from '$/state/player';
import ShareActions from './ShareActions.svelte';

var root = $.from_html(`<dialog class="zone svelte-l3wooq" aria-labelledby="share-header"><h2 class="h3" id="share-header">Share</h2> <section aria-label="Share Window" class="share-window"><button class="close svelte-l3wooq" aria-label="close">×</button> <!></section></dialog>`);

export default function ShareWindow($$anchor, $$props) {
	$.push($$props, true);

	const $episode_share_status = () => $.store_get(episode_share_status, '$episode_share_status', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let modal = $.state(null);
	let timestamp = $.prop($$props, 'timestamp', 3, true);

	async function close() {
		$.store_set(episode_share_status, false);
	}

	$.user_effect(() => {
		if ($episode_share_status()) {
			if ($.get(modal)) {
				$.get(modal).showModal();
			}
		} else {
			if ($.get(modal)) {
				$.get(modal).close();
			}
		}
	});

	var dialog = root();

	$.set_style(dialog, '', {}, { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' });

	var section = $.sibling($.child(dialog), 2);
	var button = $.child(section);
	var node = $.sibling(button, 2);

	ShareActions(node, {
		get timestamp() {
			return timestamp();
		},

		get show() {
			return $$props.show;
		}
	});

	$.reset(section);
	$.reset(dialog);
	$.bind_this(dialog, ($$value) => $.set(modal, $$value), () => $.get(modal));
	$.action(dialog, ($$node) => clickOutDialog?.($$node));
	$.event('close', dialog, close);
	$.event('click-outside', dialog, close);
	$.delegated('click', button, close);
	$.append($$anchor, dialog);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);