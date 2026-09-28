import * as $ from 'svelte/internal/server';
import { linear } from "svelte/easing";
import { fade } from "svelte/transition";
import { previewCtx } from "./preview-ctx.svelte";

export default function Preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { values, schema } = previewCtx.get();
		const { children, class: className } = $$props;
		let open = false;

		function fix(node, fn) {
			const config = fn(node);

			if (!config.delay) return config;

			const easing = config.easing ?? linear;
			const delay = config.delay;
			const duration = config.duration ?? 0;
			const newDuration = duration + delay;

			const getTimingValues = (t) => {
				const transpired = t * newDuration;
				const withoutDelay = Math.max(0, transpired - delay);
				const actualT = withoutDelay / duration;
				const easedT = easing(actualT);

				return [easedT, 1 - easedT];
			};

			const css = (_t) => {
				const [t, u] = getTimingValues(_t);

				return config.css?.(t, u) ?? "";
			};

			const tick = (_t) => {
				const [t, u] = getTimingValues(_t);

				return config.tick?.(t, u) ?? Promise.resolve();
			};

			return {
				...config,
				delay: 0,
				duration: newDuration,
				css,
				tick,
				easing: linear
			};
		}

		$$renderer.push(`<div${$.attr_class(`not-content relative grid min-h-[500px] place-items-center overflow-clip rounded-2xl border bg-gray-100 dark:border-gray-700 dark:bg-gray-950 ${$.stringify(className)}`)}><div class="w-full min-w-0 overflow-clip p-4">`);
		children($$renderer);
		$$renderer.push(`<!----></div> `);

		if (!open && values) {
			$$renderer.push(`<!--[0--><button class="absolute bottom-4 left-4 z-10 cursor-pointer rounded-lg bg-gray-500 px-2 py-1 text-sm text-white transition hover:bg-gray-700 active:bg-gray-800">Edit props</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (values) {
			$$renderer.push(`<!--[0--><div class="absolute bottom-2 left-2 top-2 z-50 w-[200px] rounded-xl border border-gray-300 bg-gray-100 p-3 shadow-xl backdrop-blur-xl dark:border-none dark:bg-gray-800/80 svelte-em1rhw" data-preview=""${$.attr('data-open', open)}><div class="flex items-center justify-between"><p class="text-xl font-bold text-black dark:text-white">Props</p> <button class="cursor-pointer rounded-lg bg-gray-500 px-2 py-1 text-sm text-white transition hover:bg-gray-600 active:bg-gray-700">Close</button></div> <hr class="mt-2 block h-[2px] rounded-full bg-gray-300/50 dark:bg-gray-600"/> <div class="mt-2 flex flex-col gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(Object.keys(values ?? {}));

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let key = each_array[$$index_1];
				const control = schema[key];

				$$renderer.push(`<label class="flex w-full flex-col items-start gap-1 text-sm font-medium">${$.escape(control.label)} `);

				if (control.type === "boolean") {
					$$renderer.push(`<!--[0--><input type="checkbox"${$.attr('checked', values[key], true)}/>`);
				} else if (control.type === "select") {
					$$renderer.push('<!--[1-->');

					$$renderer.select(
						{
							value: values[key],
							class: 'self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900'
						},
						($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(control.options);

							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let option = each_array_1[$$index];

								$$renderer.option({ value: option }, ($$renderer) => {
									$$renderer.push(`${$.escape(option)}`);
								});
							}

							$$renderer.push(`<!--]-->`);
						}
					);
				} else if (control.type === "number") {
					$$renderer.push(`<!--[2--><input type="number"${$.attr('value', (() => values[key])())}${$.attr('min', control.min)}${$.attr('max', control.max)} class="self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900"/>`);
				} else if (control.type === "string") {
					$$renderer.push(`<!--[3--><input type="text"${$.attr('value', values[key])} class="self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></label>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}