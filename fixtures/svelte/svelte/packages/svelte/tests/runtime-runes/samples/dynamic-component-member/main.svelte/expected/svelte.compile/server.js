import * as $ from 'svelte/internal/server';
import Icon from './Icon.svelte';

export default function Main($$renderer) {
	let icons = { currency: { Icon } };
	const platformIcons = $.derived(() => icons);

	if (platformIcons().currency.Icon) {
		$$renderer.push('<!--[-->');
		platformIcons().currency.Icon($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}