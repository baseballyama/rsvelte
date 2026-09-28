import * as $ from 'svelte/internal/server';

export default function ProfileMenuDivider($$renderer) {
	$$renderer.push(`<hr aria-hidden="true"${$.attr_class('', void 0, { 'bx--profile-menu__divider': true })}/>`);
}