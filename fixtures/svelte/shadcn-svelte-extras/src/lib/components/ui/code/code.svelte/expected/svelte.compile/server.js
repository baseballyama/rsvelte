import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { codeVariants } from '.';
import { useCode } from './code.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'default',
			lang = 'typescript',
			code,
			class: className,
			hideLines = false,
			highlight = [],
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const codeState = useCode({
			code: box.with(() => code.trimEnd()),
			hideLines: box.with(() => hideLines),
			highlight: box.with(() => highlight),
			lang: box.with(() => lang)
		});

		$$renderer.push(`<div${$.attributes({
			...rest,
			class: $.clsx(cn(codeVariants({ variant }), className))
		})}>${$.html(codeState.highlighted)} `);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}