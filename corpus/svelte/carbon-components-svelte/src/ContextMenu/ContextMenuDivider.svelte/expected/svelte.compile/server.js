import * as $ from 'svelte/internal/server';

export default function ContextMenuDivider($$renderer) {
	$$renderer.push(`<li role="separator"${$.attr_class('', void 0, { 'bx--menu-divider': true })}></li>`);
}