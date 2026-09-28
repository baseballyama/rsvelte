import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Values {
			#or = 'truthy';
			#and = '';
			#nullish = 'value';

			get or() {
				return this.#or ||= 'assigned';
			}

			get and() {
				return this.#and &&= 'assigned';
			}

			get nullish() {
				return this.#nullish ??= 'assigned';
			}
		}

		const values = new Values();
		const result = $.derived(() => [values.or, values.and, values.nullish]);

		$$renderer.push(`<p>${$.escape(result().join('|'))}</p>`);
	});
}