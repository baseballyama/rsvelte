import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="topic"> </span>`);
var root_1 = $.from_html(`<p class="description svelte-tdmbzg"><span class="svelte-tdmbzg"> </span></p>`);
var root_2 = $.from_html(`<a data-sveltekit-noscroll="">Show Notes</a> <a data-sveltekit-noscroll="">Transcript</a>`, 1);
var root_3 = $.from_html(`<header class="svelte-tdmbzg"><span class="show-number fst-900 grit svelte-tdmbzg"> </span> <p class="show-page-date svelte-tdmbzg"> <span class="topics svelte-tdmbzg"></span></p> <h1 class="svelte-tdmbzg"><span class="spa-ran-wrap"> </span></h1> <!></header> <div><!></div> <div class="show-actions-wrap svelte-tdmbzg"><div class="show-actions zone svelte-tdmbzg" style="--fg: var(--fg-root);"><div class="show-actions-flex svelte-tdmbzg"><button data-testid="play-show"><svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper> <!> </button> <span class="svelte-tdmbzg">or</span> <!> <!></div> <div><!> <a class="icon svelte-tdmbzg" title="Download Episode" aria-label="Download"><!></a> <a title="Edit Show Notes" aria-label="Edit Show Notes" class="icon svelte-tdmbzg"><!></a></div> <div class="variable-color-svg waves grit svelte-tdmbzg"></div></div></div> <!>   <section class="layout full"><!></section> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $player = () => $.store_get(player, '$player', $$stores);
	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.derived(() => $$props.data.show),
		time_start = $.derived(() => $$props.data.time_start);

	let downloadName = $.derived(() => `Syntax #${$.get(show).number} - ${$.get(show).title}`);

	async function handleClick(e) {
		const { target } = e;

		if (target instanceof HTMLAnchorElement && target.matches(`a[href*='#t=']`)) {
			e.preventDefault();

			const href = target.getAttribute('href');
			const timestamp = href ? tsToS(href.replace('#t=', '')) : 0;

			// If we aren't already playing this episode, load it up and then jump it
			if ($player().current_show?.number !== $.get(show).number) {
				await player.start_show($.get(show), timestamp);
			} else {
				// Jump to timestamp
				player.update_time(timestamp);
			}
		}
	}

	function play_show() {
		if ($player().current_show?.number !== $.get(show).number || $player().status === 'INITIAL') {
			player.start_show($.get(show), time_param_to_seconds($.get(time_start)));
		} else if ($player().status === 'PLAYING') {
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
		url: $page().url,
		name: $.get(show).title,
		datePublished: format($.get(show).date, 'yyyy-LL-dd'),
		// TODO: add duration once we are saving it
		// timeRequired: 'PT37M',
		description: $.get(show).aiShowNote?.description,
		associatedMedia: { '@type': 'MediaObject', contentUrl: $.get(show).url },
		partOfSeries: {
			'@type': 'PodcastSeries',
			name: 'Syntax',
			url: 'https://syntax.fm'
		}
	};

	var fragment_1 = root_3();

	$.head('tdmbzg', ($$anchor) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		$.html(node_1, () => `<script type="application/ld+json">\n${JSON.stringify(showSchema, null, 2)}\n</script>`);
		$.append($$anchor, fragment);
	});

	var header = $.first_child(fragment_1);
	var span = $.child(header);
	let styles;
	var text = $.only_child(span, true);
	var p = $.sibling(span, 2);
	let styles_1;
	var text_1 = $.child(p);
	var span_1 = $.sibling(text_1);

	$.each(span_1, 21, () => $.get(show).aiShowNote?.topics?.slice(0, 5) || [], $.index, ($$anchor, topic) => {
		var span_2 = root();
		var text_2 = $.only_child(span_2);

		$.template_effect(($0) => $.set_text(text_2, `${$0 ?? ''}${$.get(topic).name ?? ''}`), [() => $.get(topic).name.startsWith('#') ? '' : '#']);
		$.append($$anchor, span_2);
	});

	$.reset(span_1);
	$.reset(p);

	var h1 = $.sibling(p, 2);
	let styles_2;
	var span_3 = $.child(h1);
	var text_3 = $.only_child(span_3, true);

	$.reset(h1);

	var node_2 = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root_1();
			var span_4 = $.child(p_1);
			var text_4 = $.only_child(span_4, true);

			$.reset(p_1);
			$.template_effect(() => $.set_text(text_4, $.get(show).aiShowNote?.description));
			$.append($$anchor, p_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(show).aiShowNote?.description) $$render(consequent);
		});
	}

	$.reset(header);

	var div = $.sibling(header, 2);
	var node_3 = $.child(div);

	HostsAndGuests(node_3, {
		get hosts() {
			return $.get(show).hosts;
		},

		get guests() {
			return $.get(show).guests;
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var button = $.child(div_3);
	var node_4 = $.child(button);

	{
		let $0 = $.derived(() => $player().current_show?.number === $.get(show).number && $player().status === 'PLAYING' ? 'ing' : '');

		$.css_props(node_4, () => ({ '--icon_size': '12px' }));

		Icon(node_4.lastChild, {
			aria_hidden: true,
			get name() {
				return `play${$.get($0) ?? ''}`;
			}
		});

		$.reset(node_4);
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_5 = $.text('Resume');

			$.append($$anchor, text_5);
		};

		var alternate = ($$anchor) => {
			var text_6 = $.text();

			$.template_effect(() => $.set_text(text_6, `Play${$player().current_show?.number === $.get(show).number ? 'ing' : ''}`));
			$.append($$anchor, text_6);
		};

		$.if(node_5, ($$render) => {
			if ($player().status === 'PAUSED' && $player().current_show?.number === $.get(show).number) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var text_7 = $.sibling(node_5);

	$.reset(button);

	var node_6 = $.sibling(button, 4);

	ListenLinks(node_6, {
		get show() {
			return $.get(show);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	ShareButton(node_7, {
		get show() {
			return $.get(show);
		}
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_8 = $.child(div_4);

	SaveOffline(node_8, {
		get show() {
			return $.get(show);
		}
	});

	var a = $.sibling(node_8, 2);
	var node_9 = $.child(a);

	Icon(node_9, { name: 'download' });
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var node_10 = $.child(a_1);

	Icon(node_10, { name: 'edit' });
	$.reset(a_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);

	$.action(div_5, ($$node) => variable_svg?.($$node));
	$.reset(div_2);
	$.reset(div_1);

	var node_11 = $.sibling(div_1, 2);

	Tabs(node_11, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var a_2 = $.first_child(fragment_3);
			let classes;
			var a_3 = $.sibling(a_2, 2);
			let classes_1;

			$.template_effect(
				($0, $1) => {
					$.set_attribute(a_2, 'href', `/show/${$page().params.show_number ?? ''}/${$page().params.slug ?? ''}`);
					classes = $.set_class(a_2, 1, '', null, classes, { active: $0 });
					$.set_attribute(a_3, 'href', `/show/${$page().params.show_number ?? ''}/${$page().params.slug ?? ''}/transcript`);
					classes_1 = $.set_class(a_3, 1, '', null, classes_1, { active: $1 });
				},
				[
					() => !$page().url.pathname.includes('transcript'),
					() => $page().url.pathname.includes('transcript')
				]
			);

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var section = $.sibling(node_11, 2);
	var node_12 = $.child(section);

	$.snippet(node_12, () => $$props.children ?? $.noop);
	$.reset(section);

	var node_13 = $.sibling(section, 2);

	ShareWindow(node_13, {
		get show() {
			return $.get(show);
		}
	});

	$.template_effect(
		($0) => {
			$.set_attribute(span, 'title', `Show #${$.get(show).number ?? ''}`);
			$.set_attribute(span, 'aria-label', `Show #${$.get(show).number ?? ''}`);
			styles = $.set_style(span, '', styles, { '--transition-name': `show-date-${$.get(show).number ?? ''}` });
			$.set_text(text, $.get(show).number);
			styles_1 = $.set_style(p, '', styles_1, { '--transition-name': `show-date-${$.get(show).number ?? ''}` });

			$.set_text(text_1, `${$0 ?? ''}
		× `);

			styles_2 = $.set_style(h1, '', styles_2, {
				'--transition-name': `show-title-${$.get(show).number ?? ''}`
			});

			$.set_text(text_3, $.get(show).title);
			$.set_text(text_7, ` Episode ${$.get(show).number ?? ''}`);
			$.set_attribute(a, 'download', $.get(downloadName));
			$.set_attribute(a, 'href', $.get(show).url);
			$.set_attribute(a_1, 'href', 'https://github.com/syntaxfm/website/tree/main' + $.get(show).md_file);
		},
		[() => format(new Date($.get(show).date), 'MMMM do, yyyy')]
	);

	$.delegated('click', button, play_show);
	$.delegated('click', section, handleClick);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);