import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';

export default function Notification($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			content = 'Placeholder',
			special = false,
			item // injected by @svelte-put/async-stack
		} = $$props;

		function dismiss() {
			item.resolve({ reason: 'popped from within component' });
		}

		$$renderer.push(`<div${$.attr_class('not-prose pointer-events-auto relative flex items-start justify-between px-4 py-2 shadow-lg md:items-center', void 0, { 'hl-error': special, 'hl-info': !special })}><p>Notification (variant: ${$.escape(item.config.variant)}): ${$.escape(content)} (id = ${$.escape(item.config.id)})</p> <button type="button" class="c-btn c-btn--icon"><i class="i i-[x] h-6 w-6"></i> <span class="sr-only">Dismiss</span></button> <div${$.attr_class(`progress absolute inset-x-0 bottom-0 h-0.5 origin-left ${special ? 'bg-error-bg-200' : 'bg-info-bg-200'}`, 'svelte-r8lj3d', { 'paused': item.state === 'paused' })}${$.attr_style(`--progress-duration: ${item.config.timeout}ms;`)}${$.attr('aria-disabled', true)}></div></div>`);
	});
}