import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { SelectRootState } from "$lib/bits/select/select.svelte.js";
import ListboxHiddenInput from "$lib/bits/select/components/select-hidden-input.svelte";
import { watch } from "runed";

export default function Combobox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			onValueChange = noop,
			name = "",
			disabled = false,
			type,
			open = false,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			loop = false,
			scrollAlignment = "nearest",
			required = false,
			items = [],
			allowDeselect = true,
			inputValue = "",
			children
		} = $$props;

		if (value === undefined) {
			const defaultValue = type === "single" ? "" : [];

			value = defaultValue;
		}

		watch.pre(() => value, () => {
			if (value !== undefined) return;

			value = type === "single" ? "" : [];
		});

		const rootState = SelectRootState.create({
			type,
			value: boxWith(() => value, (v) => {
				value = v;

				// @ts-expect-error - we know
				onValueChange(v);
			}),
			disabled: boxWith(() => disabled),
			required: boxWith(() => required),
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			loop: boxWith(() => loop),
			scrollAlignment: boxWith(() => scrollAlignment),
			name: boxWith(() => name),
			isCombobox: true,
			items: boxWith(() => items),
			allowDeselect: boxWith(() => allowDeselect),
			inputValue: boxWith(() => inputValue, (v) => inputValue = v),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			FloatingLayer($$renderer, {
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Array.isArray(rootState.opts.value.current)) {
				$$renderer.push('<!--[0-->');

				if (rootState.opts.value.current.length) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like(rootState.opts.value.current);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						ListboxHiddenInput($$renderer, { value: item });
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				ListboxHiddenInput($$renderer, {
					get value() {
						return rootState.opts.value.current;
					},

					set value($$value) {
						rootState.opts.value.current = $$value;
						$$settled = false;
					}
				});
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, open });
	});
}