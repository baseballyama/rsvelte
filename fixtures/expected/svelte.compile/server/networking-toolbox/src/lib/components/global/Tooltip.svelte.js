import * as $ from 'svelte/internal/server';

export default function Tooltip($$renderer, $$props) {
	let { text, position = 'top', delay = 500, children } = $$props;
	let showTooltip = false;
	let tooltipTimeout;

	/**
	 * Show tooltip after delay
	 */
	function handleMouseEnter() {
		tooltipTimeout = setTimeout(
			() => {
				showTooltip = true;
			},
			delay
		);
	}

	/**
	 * Hide tooltip immediately
	 */
	function handleMouseLeave() {
		clearTimeout(tooltipTimeout);
		showTooltip = false;
	}

	$$renderer.push(`<div class="tooltip-container svelte-14refyh" role="tooltip">`);
	children($$renderer);
	$$renderer.push(`<!----> `);

	if (showTooltip) {
		$$renderer.push(`<!--[0--><div${$.attr_class(`tooltip ${$.stringify(position)}`, 'svelte-14refyh')}>${$.escape(text)}</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div>`);
}