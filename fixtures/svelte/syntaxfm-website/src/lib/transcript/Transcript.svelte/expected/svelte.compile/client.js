import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSlimUtterances } from '$server/transcripts/utils';
import { player } from '$state/player';
import format_time, { tsToS } from '$utilities/format_time';
import 'core-js/full/map/group-by';
import slug from 'speakingurl';
import Squiggle from './Squiggle.svelte';
import TableOfContents from './TableOfContents.svelte';

var root = $.from_html(`<div><div class="gutter svelte-1jm3uxo"><button class="button-nunya svelte-1jm3uxo"> </button> <p class="speaker fst-600 svelte-1jm3uxo"> </p></div> <div class="marker svelte-1jm3uxo"><span class="dot svelte-1jm3uxo"></span></div> <div class="text svelte-1jm3uxo"><p class="svelte-1jm3uxo"> </p></div></div>`);
var root_1 = $.from_html(`<section class="svelte-1jm3uxo"><header><div class="gutter svelte-1jm3uxo"><strong class="svelte-1jm3uxo"></strong> <span class="svelte-1jm3uxo"> </span></div> <div class="marker svelte-1jm3uxo"><!> <span class="dot svelte-1jm3uxo"></span> <!></div> <div class="svelte-1jm3uxo"><h4 class="svelte-1jm3uxo"> </h4></div></header> <div class="svelte-1jm3uxo"></div></section>`);
var root_2 = $.from_html(`<!> <div class="timeline svelte-1jm3uxo"></div>`, 1);

export default function Transcript($$anchor, $$props) {
	$.push($$props, true);

	const $player = () => $.store_get(player, '$player', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const slim_transcript = getSlimUtterances($$props.transcript.utterances, 1).// .filter((utterance) => utterance.speakerId !== 99)
	filter((utterance) => {
		// Remove the flagging utterances
		const scott = new RegExp(/purple cheese before meeting/gi);

		if (utterance.transcript?.match(scott)) return false;
		if (utterance.transcript.toLowerCase().startsWith('my name is scott')) return false;

		const wes = new RegExp(/my dog eats food ?(?:on)? the moon/i);

		if (utterance.transcript?.match(wes)) return false;

		return true;
	});

	// group Utterances by their summary
	const def = { time: '00:00', text: '' };

	// TODO: This is a type for Map.groupBy(). We can remove this once TypeScript ships the types for it
	const utterances_by_summary = Map.groupBy(slim_transcript, (utterance) => {
		const start = utterance.start;

		const summary = $$props.aiShowNote?.summary?.findLast((summary, i) => {
			const nextSummary = $$props.aiShowNote?.summary?.at(i + 1);
			const end = nextSummary ? tsToS(nextSummary.time) : Infinity;
			const timestamp = tsToS(summary.time);

			return start >= timestamp;
		});

		return summary || def;
	});

	let currentUtterance = $.derived(() => slim_transcript.find((utterance, index) => {
		const nextUtteranceStart = slim_transcript[index + 1]?.start || utterance.end;
		const current_time = $player()?.audio?.currentTime || 0;

		return current_time >= utterance.start && current_time <= nextUtteranceStart;
	}));

	let currentTopic = $.derived(() => $$props.aiShowNote?.summary.find((summary, index) => {
		const nextSummary = $$props.aiShowNote?.summary[index + 1];
		const topicEnd = nextSummary ? tsToS(nextSummary.time) : Infinity;
		const topicStart = tsToS(summary.time);
		const current_time = $player()?.audio?.currentTime || 0;

		return current_time >= topicStart && current_time <= topicEnd;
	}));

	let playing_show_is_this_show = $.derived(() => $player().current_show?.number === $$props.transcript.show_number);

	// const words = transcript.utterances
	// 	.map((utt) => utt.words)
	// 	.flat()
	// 	.sort((a, b) => a.start - b.start);
	// $: currentWordIndex = words.findIndex((word, index, words) => {
	// 	const nextWordStart = words[index + 1]?.start || word.end;
	// 	const currentWord = $player.current_time >= word.start && $player.current_time <= nextWordStart;
	// 	return currentWord;
	// });
	// let wordCount = 3;
	// $: highlight_words = words
	// 	.slice(
	// 		Math.floor(currentWordIndex / wordCount) * wordCount,
	// 		Math.floor(currentWordIndex / wordCount) * wordCount + wordCount
	// 	)
	// 	.map((word) => word.word)
	// 	.join(' ');
	let labelUtterance = $.derived(() => function (utterance) {
		if (!$.get(playing_show_is_this_show // not playing this show
		)) return '';

		if (utterance === $.get(currentUtterance)) {
			return 'current';
		} else if ($.get(currentUtterance) && $.get(currentUtterance)?.end > utterance.end) {
			return 'past';
		} else {
			return 'future';
		}
	});

	let placeTopic = $.derived(() => function (summary, utterances) {
		const summaryEnd = utterances.at(-1)?.end || Infinity;
		const current_time = $player()?.audio?.currentTime || 0;

		if (!$.get(playing_show_is_this_show // not playing this show
		)) return '';

		if ($.get(currentTopic)?.id === summary.id) {
			return 'current';
		} else if (current_time > summaryEnd) {
			return 'past';
		} else {
			return 'future';
		}
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			TableOfContents($$anchor, {
				get aiShowNote() {
					return $$props.aiShowNote;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.aiShowNote) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);

	$.each(div, 21, () => Array.from(utterances_by_summary), $.index, ($$anchor, $$item, i) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let summary = () => $.get($$array)[0];
		let utterances = () => $.get($$array)[1];
		var section = root_1();
		var header = $.child(section);
		var div_1 = $.child(header);
		var strong = $.child(div_1);

		strong.textContent = `Topic ${i}`;

		var span = $.sibling(strong, 2);
		var text = $.only_child(span, true);

		$.reset(div_1);

		var div_2 = $.sibling(div_1, 2);
		var node_1 = $.child(div_2);

		Squiggle(node_1, { top: true });

		var node_2 = $.sibling(node_1, 4);

		Squiggle(node_2, {});
		$.reset(div_2);

		var div_3 = $.sibling(div_2, 2);
		var h4 = $.child(div_3);
		var text_1 = $.only_child(h4, true);

		$.reset(div_3);
		$.reset(header);

		var div_4 = $.sibling(header, 2);

		$.each(div_4, 21, utterances, $.index, ($$anchor, utterance) => {
			const progress = $.derived(() => (($player()?.audio?.currentTime || 0) - $.get(utterance).start) / ($.get(utterance).end - $.get(utterance).start) * 100);
			var div_5 = root();
			var div_6 = $.child(div_5);
			var button = $.child(div_6);
			var text_2 = $.only_child(button, true);
			var p = $.sibling(button, 2);
			var text_3 = $.only_child(p, true);

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 4);
			var p_1 = $.child(div_7);
			var text_4 = $.only_child(p_1, true);

			$.reset(div_7);
			$.reset(div_5);

			$.template_effect(
				($0, $1) => {
					$.set_style(div_5, `
              --progress: ${$.get(progress) > 0 && $.get(progress) < 100 ? `${$.get(progress)}%` : '100%'};
              `);

					$.set_class(div_5, 1, `utterance ${$0 ?? ''}`, 'svelte-1jm3uxo');
					$.set_text(text_2, $1);
					$.set_text(text_3, $.get(utterance).speakerName || `Guest ${$.get(utterance).speakerId}`);
					$.set_text(text_4, $.get(utterance).transcript);
				},
				[
					() => $.get(labelUtterance)($.get(utterance)),
					() => format_time($.get(utterance).start)
				]
			);

			$.delegated('click', button, async () => {
				await player.start_show($$props.show);
				player.update_time($.get(utterance).start);
			});

			$.append($$anchor, div_5);
		});

		$.reset(div_4);
		$.reset(section);

		$.template_effect(
			($0, $1) => {
				$.set_class(header, 1, `topic ${$0 ?? ''}`, 'svelte-1jm3uxo');
				$.set_attribute(div_1, 'id', $1);
				$.set_text(text, summary().time);
				$.set_text(text_1, summary().text || 'Transcript');
			},
			[
				() => $.get(placeTopic)(summary(), utterances()),
				() => slug(summary().text)
			]
		);

		$.append($$anchor, section);
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);