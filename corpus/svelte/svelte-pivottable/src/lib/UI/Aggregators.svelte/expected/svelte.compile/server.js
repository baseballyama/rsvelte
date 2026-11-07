import * as $ from 'svelte/internal/server';
import Dropdown from "./Dropdown.svelte";

export default function Aggregators($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			onChange,
			onUpdate,
			aggregatorName,
			aggregators,
			valAttrs,
			vals
		} = $$props;

		let numValsAllowed = $.derived(() => aggregators[aggregatorName]([])().numInputs || 0);

		const sortIcons = {
			key_a_to_z: { rowSymbol: "↕", colSymbol: "↔", next: "value_a_to_z" },
			value_a_to_z: { rowSymbol: "↓", colSymbol: "→", next: "value_z_to_a" },
			value_z_to_a: { rowSymbol: "↑", colSymbol: "←", next: "key_a_to_z" }
		};

		// is it a time to use array.toSpliced(index, 1, value); ?
		const setAt = (array, index, value) => Object.assign([], array, { [index]: value });

		Dropdown($$renderer, {
			current: aggregatorName,
			values: Object.keys(aggregators),
			onchange: onChange
		});

		$$renderer.push(`<!---->   `);

		if (numValsAllowed() > 0) {
			$$renderer.push(`<!--[0--><br/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(new Array(numValsAllowed()));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let n = each_array[i];

			Dropdown($$renderer, {
				current: vals[i],
				values: valAttrs,
				onchange: (v) => onUpdate(setAt(vals, i, v))
			});

			$$renderer.push(`<!----> `);

			if (i + 1 !== numValsAllowed()) {
				$$renderer.push(`<!--[0--><br/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}