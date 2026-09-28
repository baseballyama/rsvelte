import * as $ from 'svelte/internal/server';

const iconClassMap = {
	info: 'i-[info]',
	success: 'i-[check-circle]',
	warning: 'i-[warning]',
	error: 'i-[warning-circle]'
};

export default function BaseNotification($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			item,
			title,
			status,
			class: cls,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		function dismiss() {
			item.resolve();
		}

		const iconClass = status ? iconClassMap[status] : 'i-[info]';

		$$renderer.push(`<article${$.attributes(
			{
				class: `relative rounded border shadow ${$.stringify(cls)}`,
				role: 'status',
				'aria-live': 'polite',
				'aria-atomic': 'true',
				'data-status': status,
				...rest
			},
			'svelte-pgvmbk'
		)}><button class="absolute right-0 top-0 flex -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border border-current bg-inherit p-1.5"><i class="i i-[x] h-3.5 w-3.5 svelte-pgvmbk"></i> <span class="sr-only">Dismiss</span></button> <div class="rounded-inherit relative flex items-start gap-3 overflow-hidden p-3"><div${$.attr_class(`i ${$.stringify(iconClass)} h-6 w-6 shrink-0`, 'svelte-pgvmbk')}></div> <div class="w-full leading-normal"><p${$.attr_class(`mb-2 border-b ${status ? 'border-current' : ''} pb-1 font-medium`)}>${$.escape(title ?? (status ? status[0].toUpperCase() + status.slice(1) : ''))}</p> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="progress absolute inset-x-0 bottom-0 h-0.5 origin-left overflow-hidden svelte-pgvmbk" aria-disabled="true"${$.attr_style('', {
			'--progress-duration': item.config.timeout + 'ms',
			'--progress-play-state': item.state === 'paused' ? 'paused' : 'running'
		})}></div></div></article>`);
	});
}