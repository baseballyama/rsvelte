import * as $ from 'svelte/internal/server';
import { Input } from "flowbite-svelte";

export default function Advanced($$renderer) {
	let value = 5;

	{
		function left($$renderer) {
			$$renderer.push(`<!---->#`);
		}

		function children($$renderer, props) {
			$$renderer.push(`<input${$.attributes(
				{
					type: 'number',
					...props,
					value,
					class: $.clsx([props.class, "ps-9"])
				},
				void 0,
				void 0,
				void 0,
				4
			)}/>`);
		}

		Input($$renderer, { left, children, $$slots: { left: true, default: true } });
	}
}