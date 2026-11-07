import * as $ from 'svelte/internal/server';
import { inlineSvg } from '@svelte-put/inline-svg';

export default function Action($$renderer, $$props) {
	let {
		src = 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg'
	} = $$props;

	$$renderer.push(`<svg width="100" class="svelte svelte-3biusw"></svg>`);
}