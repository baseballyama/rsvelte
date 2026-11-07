import * as $ from 'svelte/internal/server';
import ShareButton from '$/lib/share/HairButton.svelte';
import { replace_color } from '$/lib/theme/variable_color_svg.js';
import { time_param_to_seconds } from '$/utilities/time_param_to_seconds.js';
import { page } from '$app/stores';
import HostsAndGuests from '$lib/HostsAndGuests.svelte';
import Icon from '$lib/Icon.svelte';
import ListenLinks from '$lib/ListenLinks.svelte';
import Tabs from '$lib/Tabs.svelte';
import ShareWindow from '$lib/share/ShareWindow.svelte';
import { player } from '$state/player';
import { format } from 'date-fns';
import SaveOffline from '$lib/player/SaveOffline.svelte';
import { tsToS } from '$/utilities/format_time.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children } = $$props;

		let show = $.derived(() => data.show),
			time_start = $.derived(() => data.time_start);

		let downloadName = $.derived(() => `Syntax #${show().number} - ${show().title}`);

		async function handleClick(e) {
			const { target } = e;

			if (target instanceof HTMLAnchorElement && target.matches(`a[href*='#t=']`)) {
				e.preventDefault();

				const href = target.getAttribute('href');
				const timestamp = href ? tsToS(href.replace('#t=', '')) : 0;

				// If we aren't already playing this episode, load it up and then jump it
				if ($.store_get($$store_subs ??= {}, '$player', player).current_show?.number !== show().number) {
					await player.start_show(show(), timestamp);
				} else {
					// Jump to timestamp
					player.update_time(timestamp);
				}
			}
		}

		function play_show() {
			if ($.store_get($$store_subs ??= {}, '$player', player).current_show?.number !== show().number || $.store_get($$store_subs ??= {}, '$player', player).status === 'INITIAL') {
				player.start_show(show(), time_param_to_seconds(time_start()));
			} else if ($.store_get($$store_subs ??= {}, '$player', player).status === 'PLAYING') {
				player.pause();
			} else {
				player.play();
			}
		}

		function variable_svg(node) {
			replace_color(node);
		}

		const showSchema = {
			'@context': 'https://schema.org/',
			'@type': 'PodcastEpisode',
			url: $.store_get($$store_subs ??= {}, '$page', page).url,
			name: show().title,
			datePublished: format(show().date, 'yyyy-LL-dd'),
			// TODO: add duration once we are saving it
			// timeRequired: 'PT37M',
			description: show().aiShowNote?.description,
			associatedMedia: { '@type': 'MediaObject', contentUrl: show().url },
			partOfSeries: {
				'@type': 'PodcastSeries',
				name: 'Syntax',
				url: 'https://syntax.fm'
			}
		};

		$.head('tdmbzg', $$renderer, ($$renderer) => {
			$$renderer.push(`${$.html(`<script type="application/ld+json">\n${JSON.stringify(showSchema, null, 2)}\n</script>`)}`);
		});

		$$renderer.push(`<header class="svelte-tdmbzg"><span${$.attr('title', `Show #${$.stringify(show().number)}`)}${$.attr('aria-label', `Show #${$.stringify(show().number)}`)} class="show-number fst-900 grit svelte-tdmbzg"${$.attr_style('', {
			'--transition-name': `show-date-${$.stringify(show().number)}`
		})}>${$.escape(show().number)}</span> <p class="show-page-date svelte-tdmbzg"${$.attr_style('', {
			'--transition-name': `show-date-${$.stringify(show().number)}`
		})}>${$.escape(format(new Date(show().date), 'MMMM do, yyyy'))}
		× <span class="topics svelte-tdmbzg"><!--[-->`);

		const each_array = $.ensure_array_like(show().aiShowNote?.topics?.slice(0, 5) || []);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let topic = each_array[$$index];

			$$renderer.push(`<span class="topic">${$.escape(topic.name.startsWith('#') ? '' : '#')}${$.escape(topic.name)}</span>`);
		}

		$$renderer.push(`<!--]--></span></p> <h1 class="svelte-tdmbzg"${$.attr_style('', {
			'--transition-name': `show-title-${$.stringify(show().number)}`
		})}><span class="spa-ran-wrap">${$.escape(show().title)}</span></h1> `);

		if (show().aiShowNote?.description) {
			$$renderer.push(`<!--[0--><p class="description svelte-tdmbzg"><span class="svelte-tdmbzg">${$.escape(show().aiShowNote?.description)}</span></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></header> <div>`);
		HostsAndGuests($$renderer, { hosts: show().hosts, guests: show().guests });
		$$renderer.push(`<!----></div> <div class="show-actions-wrap svelte-tdmbzg"><div class="show-actions zone svelte-tdmbzg" style="--fg: var(--fg-root);"><div class="show-actions-flex svelte-tdmbzg"><button data-testid="play-show">`);

		$.css_props($$renderer, true, { '--icon_size': '12px' }, () => {
			Icon($$renderer, {
				aria_hidden: true,
				name: `play${$.store_get($$store_subs ??= {}, '$player', player).current_show?.number === show().number && $.store_get($$store_subs ??= {}, '$player', player).status === 'PLAYING' ? 'ing' : ''}`
			});
		});

		$$renderer.push(` `);

		if ($.store_get($$store_subs ??= {}, '$player', player).status === 'PAUSED' && $.store_get($$store_subs ??= {}, '$player', player).current_show?.number === show().number) {
			$$renderer.push(`<!--[0-->Resume`);
		} else {
			$$renderer.push(`<!--[-1-->Play${$.escape($.store_get($$store_subs ??= {}, '$player', player).current_show?.number === show().number ? 'ing' : '')}`);
		}

		$$renderer.push(`<!--]--> Episode ${$.escape(show().number)}</button> <span class="svelte-tdmbzg">or</span> `);
		ListenLinks($$renderer, { show: show() });
		$$renderer.push(`<!----> `);
		ShareButton($$renderer, { show: show() });
		$$renderer.push(`<!----></div> <div>`);
		SaveOffline($$renderer, { show: show() });
		$$renderer.push(`<!----> <a class="icon svelte-tdmbzg" title="Download Episode" aria-label="Download"${$.attr('download', downloadName())}${$.attr('href', show().url)}>`);
		Icon($$renderer, { name: 'download' });
		$$renderer.push(`<!----></a> <a title="Edit Show Notes" aria-label="Edit Show Notes" class="icon svelte-tdmbzg"${$.attr('href', 'https://github.com/syntaxfm/website/tree/main' + show().md_file)}>`);
		Icon($$renderer, { name: 'edit' });
		$$renderer.push(`<!----></a></div> <div class="variable-color-svg waves grit svelte-tdmbzg"></div></div></div> `);

		Tabs($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<a data-sveltekit-noscroll=""${$.attr('href', `/show/${$.stringify($.store_get($$store_subs ??= {}, '$page', page).params.show_number)}/${$.stringify($.store_get($$store_subs ??= {}, '$page', page).params.slug)}`)}${$.attr_class('', void 0, {
					'active': !$.store_get($$store_subs ??= {}, '$page', page).url.pathname.includes('transcript')
				})}>Show Notes</a> <a data-sveltekit-noscroll=""${$.attr('href', `/show/${$.stringify($.store_get($$store_subs ??= {}, '$page', page).params.show_number)}/${$.stringify($.store_get($$store_subs ??= {}, '$page', page).params.slug)}/transcript`)}${$.attr_class('', void 0, {
					'active': $.store_get($$store_subs ??= {}, '$page', page).url.pathname.includes('transcript')
				})}>Transcript</a>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->   <section class="layout full">`);
		children?.($$renderer);
		$$renderer.push(`<!----></section> `);
		ShareWindow($$renderer, { show: show() });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}