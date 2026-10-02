import * as $ from 'svelte/internal/server';
import { format } from 'date-fns';

export default function ShowTable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { shows } = $$props;

		$$renderer.push(`<div class="table-container"><table><thead><tr class="svelte-yjk7gi"><th>Date</th><th>Number</th><th>Title</th><th>Topics</th></tr></thead><tbody>`);

		if (shows.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(shows);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let show = each_array[$$index_1];

				$$renderer.push(`<tr class="svelte-yjk7gi"><td><span class="show-type fst-500 svelte-yjk7gi">`);

				if (format(show.date, 'EEE') === 'Mon') {
					$$renderer.push(`<!--[0-->Hasty`);
				} else if (format(show.date, 'EEE') === 'Wed') {
					$$renderer.push(`<!--[1-->Tasty`);
				} else if (format(show.date, 'EEE') === 'Fri') {
					$$renderer.push(`<!--[2-->Supper Club`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span> <br/> ${$.escape(format(show.date, 'EEE MMM d'))}</td><td><a${$.attr('href', `/admin/shows/${$.stringify(show.number)}`)}>${$.escape(show.number)} [↗]</a></td><td><a${$.attr('href', `/${$.stringify(show.number)}`)} target="_blank">${$.escape(show.title)}
								[↗]</a></td><td><span class="topics"><!--[-->`);

				const each_array_1 = $.ensure_array_like(show.aiShowNote?.topics?.slice(0, 5) || []);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let topic = each_array_1[$$index];

					$$renderer.push(`<span class="topic">${$.escape(topic.name.startsWith('#') ? '' : '#')}${$.escape(topic.name)}</span>`);
				}

				$$renderer.push(`<!--]--></span></td></tr>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><tr class="svelte-yjk7gi"><td class="td-full">No shows scheduled, if there should be, please let someone know</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div>`);
	});
}