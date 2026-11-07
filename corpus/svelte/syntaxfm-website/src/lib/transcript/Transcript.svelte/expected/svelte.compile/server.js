import * as $ from 'svelte/internal/server';
import { getSlimUtterances } from '$server/transcripts/utils';
import { player } from '$state/player';
import format_time, { tsToS } from '$utilities/format_time';
import 'core-js/full/map/group-by';
import slug from 'speakingurl';
import Squiggle from './Squiggle.svelte';
import TableOfContents from './TableOfContents.svelte';

export default function Transcript($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { transcript, aiShowNote, show } = $$props;

		const slim_transcript = getSlimUtterances(transcript.utterances, 1).// .filter((utterance) => utterance.speakerId !== 99)
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

			const summary = aiShowNote?.summary?.findLast((summary, i) => {
				const nextSummary = aiShowNote?.summary?.at(i + 1);
				const end = nextSummary ? tsToS(nextSummary.time) : Infinity;
				const timestamp = tsToS(summary.time);

				return start >= timestamp;
			});

			return summary || def;
		});

		let currentUtterance = $.derived(() => slim_transcript.find((utterance, index) => {
			const nextUtteranceStart = slim_transcript[index + 1]?.start || utterance.end;
			const current_time = $.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime || 0;

			return current_time >= utterance.start && current_time <= nextUtteranceStart;
		}));

		let currentTopic = $.derived(() => aiShowNote?.summary.find((summary, index) => {
			const nextSummary = aiShowNote?.summary[index + 1];
			const topicEnd = nextSummary ? tsToS(nextSummary.time) : Infinity;
			const topicStart = tsToS(summary.time);
			const current_time = $.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime || 0;

			return current_time >= topicStart && current_time <= topicEnd;
		}));

		let playing_show_is_this_show = $.derived(() => $.store_get($$store_subs ??= {}, '$player', player).current_show?.number === transcript.show_number);

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
			if (!playing_show_is_this_show()) return ''; // not playing this show

			if (utterance === currentUtterance()) {
				return 'current';
			} else if (currentUtterance() && currentUtterance()?.end > utterance.end) {
				return 'past';
			} else {
				return 'future';
			}
		});

		let placeTopic = $.derived(() => function (summary, utterances) {
			const summaryEnd = utterances.at(-1)?.end || Infinity;
			const current_time = $.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime || 0;

			if (!playing_show_is_this_show()) return ''; // not playing this show

			if (currentTopic()?.id === summary.id) {
				return 'current';
			} else if (current_time > summaryEnd) {
				return 'past';
			} else {
				return 'future';
			}
		});

		if (aiShowNote) {
			$$renderer.push('<!--[0-->');
			TableOfContents($$renderer, { aiShowNote });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="timeline svelte-1jm3uxo"><!--[-->`);

		const each_array = $.ensure_array_like(Array.from(utterances_by_summary));

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let [summary, utterances] = each_array[i];

			$$renderer.push(`<section class="svelte-1jm3uxo"><header${$.attr_class(`topic ${$.stringify(placeTopic()(summary, utterances))}`, 'svelte-1jm3uxo')}><div class="gutter svelte-1jm3uxo"${$.attr('id', slug(summary.text))}><strong class="svelte-1jm3uxo">Topic ${$.escape(i)}</strong> <span class="svelte-1jm3uxo">${$.escape(summary.time)}</span></div> <div class="marker svelte-1jm3uxo">`);
			Squiggle($$renderer, { top: true });
			$$renderer.push(`<!----> <span class="dot svelte-1jm3uxo"></span> `);
			Squiggle($$renderer, {});
			$$renderer.push(`<!----></div> <div class="svelte-1jm3uxo"><h4 class="svelte-1jm3uxo">${$.escape(summary.text || 'Transcript')}</h4></div></header> <div class="svelte-1jm3uxo"><!--[-->`);

			const each_array_1 = $.ensure_array_like(utterances);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let utterance = each_array_1[$$index];
				const progress = (($.store_get($$store_subs ??= {}, '$player', player)?.audio?.currentTime || 0) - utterance.start) / (utterance.end - utterance.start) * 100;

				$$renderer.push(`<div${$.attr_style(` --progress: ${progress > 0 && progress < 100 ? `${progress}%` : '100%'}; `)}${$.attr_class(`utterance ${$.stringify(labelUtterance()(utterance))}`, 'svelte-1jm3uxo')}><div class="gutter svelte-1jm3uxo"><button class="button-nunya svelte-1jm3uxo">${$.escape(format_time(utterance.start))}</button> <p class="speaker fst-600 svelte-1jm3uxo">${$.escape(utterance.speakerName || `Guest ${utterance.speakerId}`)}</p></div> <div class="marker svelte-1jm3uxo"><span class="dot svelte-1jm3uxo"></span></div> <div class="text svelte-1jm3uxo"><p class="svelte-1jm3uxo">${$.escape(utterance.transcript)}</p></div></div>`);
			}

			$$renderer.push(`<!--]--></div></section>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}