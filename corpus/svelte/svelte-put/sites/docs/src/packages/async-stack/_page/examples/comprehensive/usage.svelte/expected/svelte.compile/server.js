import * as $ from 'svelte/internal/server';
import { notiStack } from './notification-stack';

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pushInfo = () => notiStack.push('info', { props: { content: 'An info notification' } });
		const pushSpecial = () => notiStack.push('special');

		$$renderer.push(`<button class="c-btn c-btn--outlined">Push an info notification</button> <button class="c-btn">Push a special notification</button>`);
	});
}