import * as $ from 'svelte/internal/server';

const alerts = {
	note: { title: 'Note', classes: 'preset-tonal border-surface-950-50' },
	tip: {
		title: 'Tip',
		classes: 'preset-tonal-primary border-primary-500'
	},
	important: {
		title: 'Important',
		classes: 'preset-tonal-success border-success-500'
	},
	warning: {
		title: 'Warning',
		classes: 'preset-tonal-warning border-warning-500'
	},
	caution: {
		title: 'Caution',
		classes: 'preset-tonal-error border-error-500'
	}
};

export default function Blockquote($$renderer, $$props) {
	const { children, as: type, $$slots, $$events, ...rest } = $$props;
	const config = $.derived(() => type ? alerts[type] : null);

	if (config()) {
		$$renderer.push(`<!--[0--><div${$.attributes({
			class: `border-l-4 py-3 px-4 space-y-1 ${$.stringify(config().classes)}`,
			...rest
		})}><p class="font-bold uppercase">${$.escape(config().title)}</p> <p class="text-sm">`);

		children?.($$renderer);
		$$renderer.push(`<!----></p></div>`);
	} else {
		$$renderer.push(`<!--[-1--><blockquote${$.attributes({ class: 'blockquote', ...rest })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></blockquote>`);
	}

	$$renderer.push(`<!--]-->`);
}