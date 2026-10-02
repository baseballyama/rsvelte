import * as $ from 'svelte/internal/server';
import { useActions } from '@smui/common/internal';

export default function _UseActionsComponent($$renderer, $$props) {
	let { use = [], children } = $$props;

	$$renderer.push(`<div class="target svelte-7r5djw"><span style="user-select: none;">`);
	children?.($$renderer);
	$$renderer.push(`<!----></span></div>`);
}