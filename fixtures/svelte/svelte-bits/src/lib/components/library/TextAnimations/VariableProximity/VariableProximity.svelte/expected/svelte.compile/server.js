import * as $ from 'svelte/internal/server';

export default function VariableProximity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			label = '',
			fromFontVariationSettings = "'wght' 400, 'opsz' 9",
			toFontVariationSettings = "'wght' 800, 'opsz' 40",
			containerRef = null,
			radius = 50,
			falloff = 'linear',
			class: className = '',
			style = '',
			onclick
		} = $$props;

		let letterEls = [];

		const parsedSettings = $.derived(() => {
			const parse = (s) => new Map(s.split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
				const [name, value] = p.split(/\s+/);

				return [name.replace(/['"]/g, ''), parseFloat(value)];
			}));

			const from = parse(fromFontVariationSettings);
			const to = parse(toFontVariationSettings);

			return Array.from(from.entries()).map(([axis, fromValue]) => ({ axis, fromValue, toValue: to.get(axis) ?? fromValue }));
		});

		const words = $.derived(() => label.split(' '));

		const wordOffsets = $.derived(() => {
			const offsets = [];
			let n = 0;

			for (const w of words()) {
				offsets.push(n);
				n += w.length;
			}

			return offsets;
		});

		$$renderer.push(`<span${$.attr_class(`variable-proximity ${$.stringify(className)}`, 'svelte-l6i6p0')}${$.attr_style(style)}><!--[-->`);

		const each_array = $.ensure_array_like(words());

		for (let wIdx = 0, $$length = each_array.length; wIdx < $$length; wIdx++) {
			let word = each_array[wIdx];
			const letters = word.split('');

			$$renderer.push(`<span class="vp-word svelte-l6i6p0"><!--[-->`);

			const each_array_1 = $.ensure_array_like(letters);

			for (let lIdx = 0, $$length = each_array_1.length; lIdx < $$length; lIdx++) {
				let letter = each_array_1[lIdx];
				const idx = wordOffsets()[wIdx] + lIdx;

				$$renderer.push(`<span class="vp-letter svelte-l6i6p0" aria-hidden="true"${$.attr_style('', { 'font-variation-settings': fromFontVariationSettings })}>${$.escape(letter)}</span>`);
			}

			$$renderer.push(`<!--]--> `);

			if (wIdx < words().length - 1) {
				$$renderer.push(`<!--[0--><span class="vp-space svelte-l6i6p0"> </span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]--> <span class="sr-only svelte-l6i6p0">${$.escape(label)}</span></span>`);
	});
}