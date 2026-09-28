import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { mergeProps } from 'bits-ui';

export default function Timeline_date($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			child,
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => mergeProps(restProps, {
			class: cn('text-muted-foreground mb-1 block text-xs font-medium max-sm:group-data-[orientation=vertical]/timeline:h-4', className),
			'data-slot': 'timeline-date'
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><time${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></time>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}