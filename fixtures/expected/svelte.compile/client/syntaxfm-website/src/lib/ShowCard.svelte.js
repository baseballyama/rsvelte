import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preventDefault } from 'svelte/legacy';
import { player } from '$state/player';
import { format_show_type } from '$utilities/format_show_type';
import get_show_path from '$utilities/slug';
import { format } from 'date-fns';
import FacePile from './FacePile.svelte';
import Icon from './Icon.svelte';
import Badge from './badges/Badge.svelte';
import Badges from './badges/Badges.svelte';

var root = $.from_html(`<button data-testid="play-show" class="play-button svelte-1p0hmzg"><!></button>`);
var root_1 = $.from_html(`<span class="spa-ran-wrap"> </span>`);
var root_2 = $.from_html(`<p class="description text-sm svelte-1p0hmzg"><span class="svelte-1p0hmzg"> </span></p>`);
var root_3 = $.from_html(`<div class="buttons svelte-1p0hmzg"><button data-testid="play-show"><!> </button></div>`);
var root_4 = $.from_html(`<article><a class="svelte-1p0hmzg"><!> <span class="show-number fst-900 grit svelte-1p0hmzg"> </span> <div class="details svelte-1p0hmzg"><p class="date svelte-1p0hmzg"> <span aria-hidden="true">×</span> <time> </time></p> <!> <!> <!> <div class="bottom-row svelte-1p0hmzg"><!> <!></div></div></a></article>`);

export default function ShowCard($$anchor, $$props) {
	$.push($$props, true);

	let display = $.prop($$props, 'display', 3, 'card'),
		heading = $.prop($$props, 'heading', 3, 'h4'),
		show_date = $.prop($$props, 'show_date', 19, () => new Date($$props.show.date));

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

	const aria_key = `show${$$props.show.number}-description`;
	let hosts = $.state($.proxy([]));

	if (($$props.show?.hosts?.length || 0) > 0) {
		$$props.show.hosts?.forEach((host) => {
			$.get(hosts).push({ name: host.name || '', github: host.username || '' });
		});
	} else {
		$.set(
			hosts,
			[
				{ name: 'Wes Bos', github: 'wesbos' },
				{ name: 'Scott Tolinski', github: 'stolinski' }
			],
			true
		);
	}

	var $$exports = { aria_key };
	var article = root_4();
	var a = $.child(article);
	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var event_handler = $.derived(() => preventDefault(() => player.start_show($$props.show)));
			var node_1 = $.child(button);

			Icon(node_1, { name: 'play' });
			$.reset(button);

			$.delegated('click', button, function (...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			});

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (display() === 'list') $$render(consequent);
		});
	}

	var span = $.sibling(node, 2);
	let styles;
	var text = $.only_child(span, true);
	var div = $.sibling(span, 2);
	var p = $.child(div);
	let styles_1;
	var text_1 = $.child(p);
	var time = $.sibling(text_1, 3);
	var text_2 = $.only_child(time, true);

	$.reset(p);

	var node_2 = $.sibling(p, 2);

	$.element(node_2, heading, false, ($$element, $$anchor) => {
		$.attribute_effect(
			$$element,
			() => ({
				'data-testid': 'show-card-title',
				class: 'h3 show-title',
				style: '',
				[$.STYLE]: {
					'--transition-name': `show-title-${$$props.show.number ?? ''}`
				}
			}),
			void 0,
			void 0,
			void 0,
			'svelte-1p0hmzg'
		);

		var span_1 = root_1();
		var text_3 = $.only_child(span_1, true);

		$.template_effect(() => $.set_text(text_3, $$props.show.title));
		$.append($$anchor, span_1);
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p_1 = root_2();
			var span_2 = $.child(p_1);
			var text_4 = $.only_child(span_2, true);

			$.reset(p_1);

			$.template_effect(() => {
				$.set_attribute(p_1, 'id', aria_key);
				$.set_text(text_4, $$props.show.aiShowNote?.description);
			});

			$.append($$anchor, p_1);
		};

		var alternate = ($$anchor) => {
			const description = $.derived(() => $$props.show.show_notes?.match(/(.*?)(?=## )/s)?.[0]);
			var p_2 = root_2();
			var span_3 = $.child(p_2);
			var text_5 = $.only_child(span_3, true);

			$.reset(p_2);

			$.template_effect(() => {
				$.set_attribute(p_2, 'id', aria_key);
				$.set_text(text_5, $.get(description));
			});

			$.append($$anchor, p_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.show.aiShowNote?.description) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			Badges($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_5 = $.first_child(fragment_1);

					$.each(node_5, 17, () => $$props.show.aiShowNote.topics.filter((topic) => topic.name.length < 15).slice(0, 4), $.index, ($$anchor, topic) => {
						Badge($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text();

								$.template_effect(($0) => $.set_text(text_6, `${$0 ?? ''}${$.get(topic).name ?? ''}`), [() => $.get(topic).name.startsWith('#') ? '' : '#']);
								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if ($$props.show.aiShowNote?.topics) $$render(consequent_2);
		});
	}

	var div_1 = $.sibling(node_4, 2);
	var node_6 = $.child(div_1);

	{
		let $0 = $.derived(() => [
			...$.get(hosts),
			...($$props.show.guests || []).map((guest) => ({ name: guest.Guest.name, github: guest.Guest.github || '' }))
		]);

		FacePile(node_6, {
			get faces() {
				return $.get($0);
			}
		});
	}

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_2 = root_3();
			var button_1 = $.child(div_2);
			var event_handler_1 = $.derived(() => preventDefault(() => player.start_show($$props.show)));
			let classes;
			var node_8 = $.child(button_1);

			Icon(node_8, { name: 'play' });

			var text_7 = $.sibling(node_8);

			$.reset(button_1);
			$.reset(div_2);

			$.template_effect(() => {
				classes = $.set_class(button_1, 1, '', null, classes, { play: display() === 'highlight' });
				$.set_text(text_7, ` Play #${$$props.show.number ?? ''}`);
			});

			$.delegated('click', button_1, function (...$$args) {
				$.get(event_handler_1)?.apply(this, $$args);
			});

			$.append($$anchor, div_2);
		};

		$.if(node_7, ($$render) => {
			if (display() === 'highlight' || display() === 'card') $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.reset(a);
	$.reset(article);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_class(article, 1, $.clsx(display()), 'svelte-1p0hmzg');
			$.set_attribute(a, 'href', $0);
			$.set_attribute(a, 'aria-label', `Show #${$$props.show.number ?? ''} posted ${$1 ?? ''}, ${$$props.show.title ?? ''}`);
			$.set_attribute(a, 'aria-describedby', aria_key);

			styles = $.set_style(span, '', styles, {
				'--transition-name': `show-date-${$$props.show.number ?? ''}`
			});

			$.set_text(text, $$props.show.number);

			styles_1 = $.set_style(p, '', styles_1, {
				'--transition-name': `show-date-${$$props.show.number ?? ''}`
			});

			$.set_text(text_1, `${$2 ?? ''} `);
			$.set_attribute(time, 'datetime', $3);
			$.set_attribute(time, 'title', $4);
			$.set_text(text_2, $5);
		},
		[
			() => get_show_path($$props.show),
			() => format_date(show_date()),
			() => format_show_type($$props.show.date),
			() => show_date().toISOString(),
			() => show_date().toDateString(),
			() => format_date(show_date())
		]
	);

	$.append($$anchor, article);

	return $.pop($$exports);
}

$.delegate(['click']);