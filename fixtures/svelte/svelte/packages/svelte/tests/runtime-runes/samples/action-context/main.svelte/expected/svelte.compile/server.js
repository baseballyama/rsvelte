import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		/**
		 * @param {Element} _
		 * @param {number} count
		 */
		function action(_, count) {
			return {
				count,
				/** @param {number} count */
				update(count) {
					console.log('update', this.count, this.count = count);
				},

				destroy() {
					console.log('destroy', this.count);
				}
			};
		}

		if (count < 2) {
			$$renderer.push(`<!--[0--><button>${$.escape(count)}</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}