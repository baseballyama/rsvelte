import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';
import { TimeField } from 'bits-ui';

export default function Time_segment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, segment } = $$props;

		if (TimeField.Segment) {
			$$renderer.push('<!--[-->');

			TimeField.Segment($$renderer, {
				part: segment.part,
				class: cn('text-foreground focus:bg-accent data-invalid:focused:bg-destructive focused:aria-[valuetext=Empty]:text-foreground focused:text-foreground data-invalid:aria-[valuetext=Empty]:text-destructive data-invalid:text-destructive aria-[valuetext=Empty]:text-muted-foreground/70 data-invalid:focused:text-white data-invalid:focused:aria-[valuetext=Empty]:text-white inline rounded p-0.5 caret-transparent outline-hidden disabled:cursor-not-allowed disabled:opacity-50', 'data-[segment=literal]:text-muted-foreground/70 data-[segment=literal]:px-0', className),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(segment.value)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}