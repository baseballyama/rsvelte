import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {Record<string, { href: string; title: string; }[]>} readonly
		 * @property {string} [optional]
		 * @property {any} binding
		 * @property {string} [bindingOptional]
		 */
		/** @type {Props} */
		let {
			readonly,
			optional = 'foo',
			binding = void 0,
			bindingOptional = 'bar'
		} = $$props;

		$$renderer.push(`<!---->${$.escape(readonly)}
${$.escape(optional)} <input${$.attr('value', binding)}/> <input${$.attr('value', bindingOptional)}/>`);

		$.bind_props($$props, { binding, bindingOptional });
	});
}