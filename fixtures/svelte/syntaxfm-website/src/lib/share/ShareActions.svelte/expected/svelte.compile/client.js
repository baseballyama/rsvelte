import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/Icon.svelte';
import { player } from '$state/player';
import toast, { Toaster } from 'svelte-french-toast';

var root = $.from_html(`<p><label><input type="checkbox"/> Start at timestamp:</label> <input type="text"/></p>`);
var root_1 = $.from_html(`<!> <!> <button aria-label="Copy Embed Code for this show"><!> Embed</button> <button aria-label="Copy link to this show"><!> Link</button> <a class="button share--x svelte-1f3h7up" target="_blank" aria-label="Share on Twitter"><!></a> <a class="button share--facebook svelte-1f3h7up" target="_blank" aria-label="Share on Facebook"><!> Facebook</a> <a target="_blank" class="button share--linkedin svelte-1f3h7up" aria-label="Share on LinkedIn"><!> LinkedIn</a>`, 1);

export default function ShareActions($$anchor, $$props) {
	$.push($$props, true);

	const $player = () => $.store_get(player, '$player', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let timestamp = $.prop($$props, 'timestamp', 3, true);
	let share_at_ts = $.state(false);

	const toHMS = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);
		const secs = seconds % 60;

		// Formatting to ensure two digits for minutes and seconds
		const formattedMinutes = minutes.toString().padStart(2, '0');

		const formattedSeconds = secs.toString().padStart(2, '0');

		return `${hours}:${formattedMinutes}:${formattedSeconds}`;
	};

	function copy(link) {
		navigator.clipboard.writeText(decodeURIComponent(link));
		toast.success(`Copied show link to clipboard`);
	}

	function copy_embed() {
		navigator.clipboard.writeText(`
<iframe
	scrolling="no"
	src="https://syntax.fm/embed/${$$props.show.number}"
	title="Show Embed"
	style="width: 100%; height: 230px; max-width: 1200px; border: 1px solid black"
/>
		`);

		toast.success(`Copied embed HTML to clipboard, if you post, let us know, we're happy to share.`);
	}

	let time_stamp = $.derived(() => $.get(share_at_ts) && $player()?.audio?.currentTime
		? `%3Ft%3D${toHMS(Math.trunc($player().audio?.currentTime))}`
		: ``);

	let share_url = $.derived(() => `https%3A//syntax.fm/${$$props.show.number}${$.get(time_stamp)}`);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var label = $.child(p);
			var input = $.child(label);

			$.remove_input_defaults(input);
			$.next();
			$.reset(label);

			var input_1 = $.sibling(label, 2);

			$.remove_input_defaults(input_1);
			$.reset(p);
			$.template_effect(($0) => $.set_value(input_1, $0), [() => toHMS(Math.trunc($player()?.audio?.currentTime || 0))]);
			$.bind_checked(input, () => $.get(share_at_ts), ($$value) => $.set(share_at_ts, $$value));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (timestamp()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Toaster(node_1, {});

	var button = $.sibling(node_1, 2);
	var node_2 = $.child(button);

	Icon(node_2, { name: 'code' });
	$.next();
	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_3 = $.child(button_1);

	Icon(node_3, { name: 'link' });
	$.next();
	$.reset(button_1);

	var a = $.sibling(button_1, 2);
	var node_4 = $.child(a);

	Icon(node_4, { name: 'x' });
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_5 = $.child(a_1);

	Icon(node_5, { name: 'facebook' });
	$.next();
	$.reset(a_1);

	var a_2 = $.sibling(a_1, 2);
	var node_6 = $.child(a_2);

	Icon(node_6, { name: 'linkedin' });
	$.next();
	$.reset(a_2);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `https://twitter.com/intent/tweet?url=${$.get(share_url) ?? ''}&text=${$$props.show.title ?? ''}&via=syntaxfm`);
		$.set_attribute(a_1, 'href', `https://facebook.com/sharer/sharer.php?u=${$.get(share_url) ?? ''}&quote=${$$props.show.title ?? ''}`);
		$.set_attribute(a_2, 'href', `https://www.linkedin.com/sharing/share-offsite/?url=${$.get(share_url) ?? ''}`);
	});

	$.delegated('click', button, copy_embed);
	$.delegated('click', button_1, () => copy($.get(share_url)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);