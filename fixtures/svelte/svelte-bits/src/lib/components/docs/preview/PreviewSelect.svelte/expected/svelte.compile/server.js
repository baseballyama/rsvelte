import * as $ from 'svelte/internal/server';

export default function PreviewSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title = '',
			value = '',
			options = [],
			isDisabled = false,
			onChange
		} = $$props;

		let open = false;
		let rootEl = null;
		const normalized = $.derived(() => options.map((o) => typeof o === 'string' ? { label: o, value: o } : o));
		const current = $.derived(() => normalized().find((o) => o.value === value));

		function pick(v) {
			onChange?.(v);
			open = false;
		}

		$$renderer.push(`<div class="scrubber"><button type="button" class="scrubber-track scrubber-track--select" aria-haspopup="listbox"${$.attr('aria-expanded', open)}${$.attr('aria-label', title)}${$.attr('aria-disabled', isDisabled)}${$.attr('data-disabled', isDisabled)}${$.attr('data-active', open)}><div class="scrubber-label">${$.escape(title)}</div> <div class="scrubber-select-right"><span class="scrubber-value">${$.escape(current()?.label ?? value)}</span> <svg${$.attr_class(`scrubber-caret ${open ? 'scrubber-caret--open' : ''}`)} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></div></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="scrubber-dropdown" role="listbox"><!--[-->`);

			const each_array = $.ensure_array_like(normalized());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let opt = each_array[$$index];

				$$renderer.push(`<button type="button"${$.attr_class(`scrubber-dropdown-item ${opt.value === value ? 'scrubber-dropdown-item--active' : ''}`)} role="option"${$.attr('aria-selected', opt.value === value)}>${$.escape(opt.label)}</button>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}