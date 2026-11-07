import * as $ from 'svelte/internal/server';
import { Loader2 } from '@lucide/svelte';

export default function Ll_button($$renderer, $$props) {
	/**
	 * Lime button — square (no radius), uppercase, thin outline.
	 * `filled` = plum background / white text; `outline` = plum text on white
	 * with a 1px current-color border, matching the source CTA buttons.
	 * Shows an inline spinner while `loading`, per the project's async-button rule.
	 */
	let {
		variant = 'filled',
		href,
		type = 'button',
		loading = false,
		disabled = false,
		full = false,
		onclick,
		children,
		$$slots,
		$$events,
		...rest
	} = $$props;

	if (href) {
		$$renderer.push(`<!--[0--><a${$.attributes(
			{
				href,
				class: `ll-btn ll-btn--${$.stringify(variant)}`,
				'aria-disabled': disabled || loading,
				...rest
			},
			'svelte-kb7xdd',
			{
				'll-btn--full': full,
				'll-btn--disabled': disabled || loading
			}
		)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Loader2($$renderer, { class: 'll-btn-spin' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----></a>`);
	} else {
		$$renderer.push(`<!--[-1--><button${$.attributes(
			{
				type,
				class: `ll-btn ll-btn--${$.stringify(variant)}`,
				disabled: disabled || loading,
				...rest
			},
			'svelte-kb7xdd',
			{ 'll-btn--full': full }
		)}>`);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Loader2($$renderer, { class: 'll-btn-spin' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----></button>`);
	}

	$$renderer.push(`<!--]-->`);
}