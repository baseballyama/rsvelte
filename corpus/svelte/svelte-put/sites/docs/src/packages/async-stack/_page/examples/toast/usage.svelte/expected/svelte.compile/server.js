import * as $ from 'svelte/internal/server';
import { toast } from './toast';

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const message = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`;

		$$renderer.push(`<div class="not-prose flex flex-wrap items-center gap-2"><button class="c-btn c-btn--outlined">info</button> <button class="c-btn c-btn--outlined">success</button> <button class="c-btn c-btn--outlined">warning</button> <button class="c-btn c-btn--outlined">error</button></div>`);
	});
}