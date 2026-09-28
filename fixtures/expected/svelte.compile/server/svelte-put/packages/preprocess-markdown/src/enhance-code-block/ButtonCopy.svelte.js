import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';

export function copyCode(input) {
	const codeNode = input.node.getElementsByTagName('code')[0];

	if (!codeNode) return '';

	let text = '';

	for (const lineNode of codeNode.children) {
		// assuming shiki build output and transformers set up at mdsvex.config.js
		if (lineNode.dataset.lineDiff === '-') continue;

		text += (lineNode.textContent || '') + '\n';
	}

	return text;
}

export default function ButtonCopy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { trigger = void 0, $$slots, $$events, ...rest } = $$props;
		let timeoutId = undefined;
		let optimistic = false;

		function onClick() {
			optimistic = true;
		}

		function onMouseEnter() {
			clearTimeout(timeoutId);
		}

		function onMouseLeave() {
			timeoutId = setTimeout(
				() => {
					optimistic = false;
				},
				1800
			);
		}

		let hydrated = false;

		onMount(() => {
			hydrated = true;
		});

		if (hydrated) {
			$$renderer.push(`<!--[0--><button${$.attributes({ type: 'button', disabled: optimistic, ...rest }, 'svelte-qkn3x4')}><span class="sr-only">Copy</span> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentcolor" viewBox="0 0 256 256">`);

			if (optimistic) {
				$$renderer.push(`<!--[0--><path d="M168,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,152Zm-8-40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm56-64V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V48A16,16,0,0,1,56,32H92.26a47.92,47.92,0,0,1,71.48,0H200A16,16,0,0,1,216,48ZM96,64h64a32,32,0,0,0-64,0ZM200,48H173.25A47.93,47.93,0,0,1,176,64v8a8,8,0,0,1-8,8H88a8,8,0,0,1-8-8V64a47.93,47.93,0,0,1,2.75-16H56V216H200Z"></path>`);
			} else {
				$$renderer.push(`<!--[-1--><path d="M200,32H163.74a47.92,47.92,0,0,0-71.48,0H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-72,0a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm72,184H56V48H82.75A47.93,47.93,0,0,0,80,64v8a8,8,0,0,0,8,8h80a8,8,0,0,0,8-8V64a47.93,47.93,0,0,0-2.75-16H200Z"></path>`);
			}

			$$renderer.push(`<!--]--></svg></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { trigger });
	});
}