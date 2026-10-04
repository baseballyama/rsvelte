import * as $ from 'svelte/internal/server';

export default function Class($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Value {
			#value = "a";
			get value() {
				return this.#value;
			}
			set value(next) {
				this.#value = next;
			}
		}
		const value = new Value();
		$$renderer.push(`<p${$.attr_class($.clsx(value.value), 'svelte-eso81h')}></p>`);
	});
}
