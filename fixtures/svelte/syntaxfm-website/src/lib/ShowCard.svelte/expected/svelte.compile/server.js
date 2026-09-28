import * as $ from 'svelte/internal/server';
import { preventDefault } from 'svelte/legacy';
import { player } from '$state/player';
import { format_show_type } from '$utilities/format_show_type';
import get_show_path from '$utilities/slug';
import { format } from 'date-fns';
import FacePile from './FacePile.svelte';
import Icon from './Icon.svelte';
import Badge from './badges/Badge.svelte';
import Badges from './badges/Badges.svelte';

export default function ShowCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			show,
			display = 'card',
			heading = 'h4',
			show_date = new Date(show.date)
		} = $$props;

		function format_date(date, baseDate = new Date()) {
			const timeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
			const diff = date.getTime() - baseDate.getTime();
			const days = diff / (1000 * 60 * 60 * 24) * -1;

			switch (true) {
				case days < 1:
					return timeFormatter.format(-Math.round(days * 24), 'hour');

				case days < 12:
					return timeFormatter.format(-Math.floor(days), 'day');

				case days < 30:
					return timeFormatter.format(-Math.floor(days / 7), 'week');

				default:
					return format(date, 'MMMM do, yyyy');
			}
		}

		const aria_key = `show${show.number}-description`;
		let hosts = [];

		if ((show?.hosts?.length || 0) > 0) {
			show.hosts?.forEach((host) => {
				hosts.push({ name: host.name || '', github: host.username || '' });
			});
		} else {
			hosts = [
				{ name: 'Wes Bos', github: 'wesbos' },
				{ name: 'Scott Tolinski', github: 'stolinski' }
			];
		}

		$$renderer.push(`<article${$.attr_class($.clsx(display), 'svelte-1p0hmzg')}><a${$.attr('href', get_show_path(show))}${$.attr('aria-label', `Show #${$.stringify(show.number)} posted ${$.stringify(format_date(show_date))}, ${$.stringify(show.title)}`)}${$.attr('aria-describedby', aria_key)} class="svelte-1p0hmzg">`);

		if (display === 'list') {
			$$renderer.push(`<!--[0--><button data-testid="play-show" class="play-button svelte-1p0hmzg">`);
			Icon($$renderer, { name: 'play' });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span class="show-number fst-900 grit svelte-1p0hmzg"${$.attr_style('', { '--transition-name': `show-date-${$.stringify(show.number)}` })}>${$.escape(show.number)}</span> <div class="details svelte-1p0hmzg"><p class="date svelte-1p0hmzg"${$.attr_style('', { '--transition-name': `show-date-${$.stringify(show.number)}` })}>${$.escape(format_show_type(show.date))} <span aria-hidden="true">×</span> <time${$.attr('datetime', show_date.toISOString())}${$.attr('title', show_date.toDateString())}>${$.escape(format_date(show_date))}</time></p> `);

		$.element(
			$$renderer,
			heading,
			() => {
				$$renderer.push(` data-testid="show-card-title" class="h3 show-title svelte-1p0hmzg"${$.attr_style('', {
					'--transition-name': `show-title-${$.stringify(show.number)}`
				})}`);
			},
			() => {
				$$renderer.push(`<span class="spa-ran-wrap">${$.escape(show.title)}</span>`);
			}
		);

		$$renderer.push(` `);

		if (show.aiShowNote?.description) {
			$$renderer.push(`<!--[0--><p${$.attr('id', aria_key)} class="description text-sm svelte-1p0hmzg"><span class="svelte-1p0hmzg">${$.escape(show.aiShowNote?.description)}</span></p>`);
		} else {
			$$renderer.push('<!--[-1-->');

			const description = show.show_notes?.match(/(.*?)(?=## )/s)?.[0];

			$$renderer.push(`<p${$.attr('id', aria_key)} class="description text-sm svelte-1p0hmzg"><span class="svelte-1p0hmzg">${$.escape(description)}</span></p>`);
		}

		$$renderer.push(`<!--]--> `);

		if (show.aiShowNote?.topics) {
			$$renderer.push('<!--[0-->');

			Badges($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(show.aiShowNote.topics.filter((topic) => topic.name.length < 15).slice(0, 4));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let topic = each_array[$$index];

						Badge($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(topic.name.startsWith('#') ? '' : '#')}${$.escape(topic.name)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="bottom-row svelte-1p0hmzg">`);

		FacePile($$renderer, {
			faces: [
				...hosts,
				...(show.guests || []).map((guest) => ({ name: guest.Guest.name, github: guest.Guest.github || '' }))
			]
		});

		$$renderer.push(`<!----> `);

		if (display === 'highlight' || display === 'card') {
			$$renderer.push(`<!--[0--><div class="buttons svelte-1p0hmzg"><button data-testid="play-show"${$.attr_class('', void 0, { 'play': display === 'highlight' })}>`);
			Icon($$renderer, { name: 'play' });
			$$renderer.push(`<!----> Play #${$.escape(show.number)}</button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></a></article>`);
		$.bind_props($$props, { aria_key });
	});
}