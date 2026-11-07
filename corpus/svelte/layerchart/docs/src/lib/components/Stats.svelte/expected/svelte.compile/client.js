import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollingValue } from 'svelte-ux';
import { IsInViewport, useInterval } from 'runed';
import { format } from '@layerstack/utils';
import { getStats } from '$lib/stats.remote';

var root = $.from_html(`<div class="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center px-1 py-2 rounded-xl outline m-4 outline-surface-100 h-36 md:h-18 animate-pulse"></div>`);
var root_1 = $.from_html(`<div class="text-lg font-bold text-surface-content"> </div> <div class="text-xs text-surface-content/60 text-center"> </div>`, 1);
var root_2 = $.from_html(`<div class="h-14 w-36 text-center pt-1"><!></div>`);
var root_3 = $.from_html(`<div class="flex flex-col items-center px-4 py-2 text-lg"><span class="font-bold text-surface-content"> </span> <span class="text-xs text-surface-content/60"> </span></div>`);
var root_4 = $.from_html(`<div class="w-0.5 h-12 bg-surface-content/5 hidden md:block"></div>`);
var root_5 = $.from_html(`<a target="_blank" class="flex flex-col justify-center items-center rounded-xl border border-transparent hover:bg-surface-100/50 hover:border-primary/20 whitespace-nowrap w-1/2 md:w-auto"><!></a> <!>`, 1);
var root_6 = $.from_html(`<div class="flex flex-wrap items-center justify-evenly px-1 py-2 rounded-xl outline m-4 outline-surface-content/10"></div>`);

export default function Stats($$anchor, $$props) {
	$.push($$props, true);

	const query = getStats();
	let npmEl = $.state(void 0);
	const inViewport = new IsInViewport(() => $.get(npmEl));
	const interval = useInterval(8000);

	$.user_effect(() => {
		if (inViewport.current) {
			interval.resume();
		} else {
			interval.pause();
		}
	});

	const stats = $.derived(() => query.current
		? [
			{
				label: ' Downloads',
				value: query.current.npmDownloads,
				link: 'https://npmjs.com/package/layerchart',
				intervals: ['Weekly', 'Monthly', 'Lifetime']
			},

			{
				label: 'GitHub Stars',
				value: query.current.githubStars,
				link: 'https://github.com/techniq/layerchart'
			},

			{
				label: 'Discord Members',
				value: query.current.discordMembers,
				link: 'https://discord.gg/697JhMPD3t'
			},

			{
				label: 'Bluesky Followers',
				value: query.current.bskyFollowers,
				link: 'https://bsky.app/profile/techniq.dev'
			}
		].filter((s) => s.value != null)
		: []);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var alternate_1 = ($$anchor) => {
			var div_1 = root_6();

			$.each(div_1, 23, () => $.get(stats), ({ label, value, link, intervals }) => value, ($$anchor, $$item, index) => {
				let label = () => $.get($$item).label;
				let value = () => $.get($$item).value;
				let link = () => $.get($$item).link;
				let intervals = () => $.get($$item).intervals;
				var fragment_1 = root_5();
				var a = $.first_child(fragment_1);
				var node_1 = $.child(a);

				{
					var consequent_1 = ($$anchor) => {
						var div_2 = root_2();
						var node_2 = $.child(div_2);

						ScrollingValue(node_2, {
							get value() {
								return interval.counter;
							},
							axis: 'y',
							children: ($$anchor, $$slotProps) => {
								const intervalIndex = $.derived(() => interval.counter % intervals().length);
								var fragment_2 = root_1();
								var div_3 = $.first_child(fragment_2);
								var text = $.only_child(div_3, true);
								var div_4 = $.sibling(div_3, 2);
								var text_1 = $.only_child(div_4);

								$.template_effect(
									($0) => {
										$.set_text(text, $0);

										$.set_text(text_1, `${intervals()[$.get(intervalIndex)] ?? ''}
								${label() ?? ''}`);
									},
									[
										() => format(query.current.npmDownloads[$.get(intervalIndex)], 'metric', { fractionDigits: 1 }).toLowerCase() + '+'
									]
								);

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_2);
						$.bind_this(div_2, ($$value) => $.set(npmEl, $$value), () => $.get(npmEl));
						$.event('pointerenter', div_2, () => interval.pause());
						$.event('pointerleave', div_2, () => interval.resume());
						$.append($$anchor, div_2);
					};

					var alternate = ($$anchor) => {
						var div_5 = root_3();
						var span = $.child(div_5);
						var text_2 = $.only_child(span, true);
						var span_1 = $.sibling(span, 2);
						var text_3 = $.only_child(span_1, true);

						$.reset(div_5);

						$.template_effect(
							($0) => {
								$.set_text(text_2, $0);
								$.set_text(text_3, label());
							},
							[
								() => format(value(), 'metric', { fractionDigits: 1 }).toLowerCase() + '+'
							]
						);

						$.append($$anchor, div_5);
					};

					$.if(node_1, ($$render) => {
						if (intervals()) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.reset(a);

				var node_3 = $.sibling(a, 2);

				{
					var consequent_2 = ($$anchor) => {
						var div_6 = root_4();

						$.append($$anchor, div_6);
					};

					$.if(node_3, ($$render) => {
						if ($.get(index) < $.get(stats).length - 1) $$render(consequent_2);
					});
				}

				$.template_effect(() => $.set_attribute(a, 'href', link()));
				$.append($$anchor, fragment_1);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (query.loading || query.error || !query.current) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}