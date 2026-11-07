import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} data
		 */
		/** @type {Props} */
		let { data } = $$props;

		$$renderer.push(`<main><div${$.attr_style('', { 'margin-bottom': '2rem' })}><h2 class="h3">Sick Picks</h2> <p class="text-xs">(things we pick that are sick)</p> <!--[-->`);

		const each_array = $.ensure_array_like(data.sickPicks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let show = each_array[$$index];

			$$renderer.push(`<h3 class="h5"><a${$.attr('href', `/${show.number}`)}>#${$.escape(show.number)}</a> `);

			if (show.guests.length) {
				$$renderer.push(`<!--[0-->w/ ${$.escape(show.guests.join(', '))}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></h3> ${$.html(show.rendered)}`);
		}

		$$renderer.push(`<!--]--></div></main>`);
	});
}