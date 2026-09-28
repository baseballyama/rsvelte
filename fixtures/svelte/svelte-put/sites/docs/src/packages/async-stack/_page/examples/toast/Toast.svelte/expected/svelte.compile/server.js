import * as $ from 'svelte/internal/server';

const iconClassMap = {
	info: 'i-[info]',
	success: 'i-[check-circle]',
	warning: 'i-[warning]',
	error: 'i-[warning-circle]'
};

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			item,
			title,
			message,
			status = 'info',
			class: cls,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const iconClass = $.derived(() => status ? iconClassMap[status] : 'i-[info]');

		function dismiss() {
			item.resolve();
		}

		$$renderer.push(`<article${$.attributes(
			{
				class: `relative shadow ${$.stringify(cls)}`,
				role: 'status',
				'aria-live': 'polite',
				'aria-atomic': 'true',
				'data-status': status,
				...rest
			},
			'svelte-ogf5ng'
		)}><button class="absolute right-0 top-0 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border border-current bg-inherit p-1.5"><i class="i i-[x] h-3.5 w-3.5 svelte-ogf5ng"></i> <span class="sr-only">Dismiss</span></button> <div class="relative flex items-start gap-3 overflow-hidden p-3"><div${$.attr_class(`i ${$.stringify(iconClass())} h-6 w-6 shrink-0`, 'svelte-ogf5ng')}></div> <div class="leading-normal"><p class="mb-2 border-b border-current pb-1 font-medium">${$.escape(title)}</p> <p>${$.escape(message)}</p></div> <div class="progress absolute inset-x-0 bottom-0 h-0.5 origin-left overflow-hidden svelte-ogf5ng" aria-disabled="true"${$.attr_style('', {
			'--progress-duration': item.config.timeout + 'ms',
			'--progress-play-state': item.state === 'paused' ? 'paused' : 'running'
		})}></div></div></article>`);
	});
}