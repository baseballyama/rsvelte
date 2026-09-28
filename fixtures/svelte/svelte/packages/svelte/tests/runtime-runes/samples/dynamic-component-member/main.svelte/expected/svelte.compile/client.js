import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from './Icon.svelte';

export default function Main($$anchor) {
	let icons = $.proxy({ currency: { Icon } });
	const platformIcons = $.derived(() => icons);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(platformIcons).currency.Icon, ($$anchor, platformIcons_currency_Icon) => {
		platformIcons_currency_Icon($$anchor, {});
	});

	$.append($$anchor, fragment);
}