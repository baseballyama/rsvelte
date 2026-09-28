import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconBrandGithub,
	IconCheck,
	IconExternalLink,
	IconFilter,
	IconRss,
	IconServer,
	IconUsers,
	IconX
} from '@tabler/icons-svelte';

import { s } from '$lib/client/localization.svelte';

var root = $.from_svg(`<line stroke-width="1" opacity="0"></line>`);
var root_1 = $.from_svg(`<circle opacity="0"></circle>`);
var root_2 = $.from_html(`<div class="min-h-screen bg-app-bg svelte-cvsk4a"><button class="fixed top-5 right-5 z-10 text-sm text-primary-400 hover:text-primary-600 transition-colors svelte-cvsk4a"> </button> <header class="pt-16 pb-10 px-5 text-center hero-fade svelte-cvsk4a"><img src="/favicon.svg" alt="" class="w-14 h-14 mx-auto mb-5 svelte-cvsk4a"/> <h1 class="text-3xl md:text-4xl font-bold text-primary svelte-cvsk4a"> </h1> <p class="mt-2 text-base text-primary-600 max-w-lg mx-auto svelte-cvsk4a"> </p></header> <div class="max-w-2xl mx-auto px-5 pb-20 space-y-12 svelte-cvsk4a"><section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-5 svelte-cvsk4a"> </h2> <div class="space-y-6 svelte-cvsk4a"><div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">1</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a"> </h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div></div> <div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">2</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a"> </h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div></div> <div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">3</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a"> </h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div></div></div> <div class="mt-6 flex justify-center bg-primary-50 rounded-lg py-6 svelte-cvsk4a" aria-hidden="true"><svg class="clustering-illustration svelte-cvsk4a" viewBox="0 0 280 120" width="300" height="129"><circle class="dot dot-a1 svelte-cvsk4a" cx="30" cy="20" r="6" fill="#3b82f6" opacity="0.7"></circle><circle class="dot dot-a2 svelte-cvsk4a" cx="80" cy="90" r="6" fill="#6366f1" opacity="0.7"></circle><circle class="dot dot-a3 svelte-cvsk4a" cx="50" cy="55" r="6" fill="#8b5cf6" opacity="0.7"></circle><circle class="dot dot-a4 svelte-cvsk4a" cx="15" cy="70" r="5" fill="#a78bfa" opacity="0.6"></circle><circle class="dot dot-a5 svelte-cvsk4a" cx="75" cy="30" r="5" fill="#818cf8" opacity="0.6"></circle><circle class="dot dot-b1 svelte-cvsk4a" cx="200" cy="25" r="6" fill="#10b981" opacity="0.7"></circle><circle class="dot dot-b2 svelte-cvsk4a" cx="250" cy="80" r="6" fill="#14b8a6" opacity="0.7"></circle><circle class="dot dot-b3 svelte-cvsk4a" cx="220" cy="65" r="6" fill="#06b6d4" opacity="0.7"></circle><circle class="dot dot-b4 svelte-cvsk4a" cx="265" cy="35" r="5" fill="#34d399" opacity="0.6"></circle><circle class="dot dot-l1 svelte-cvsk4a" cx="140" cy="30" r="5" fill="#f59e0b" opacity="0.7"></circle><circle class="dot dot-l2 svelte-cvsk4a" cx="150" cy="100" r="5" fill="#ef4444" opacity="0.7"></circle><circle class="dot dot-l3 svelte-cvsk4a" cx="125" cy="70" r="4" fill="#f97316" opacity="0.6"></circle><circle class="cluster-ring ring-a svelte-cvsk4a" cx="55" cy="55" r="26" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0"></circle><circle class="cluster-ring ring-b svelte-cvsk4a" cx="228" cy="52" r="24" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0"></circle><text class="cluster-label label-a svelte-cvsk4a" x="55" y="92" text-anchor="middle" font-size="9" fill="#6366f1" opacity="0">story</text><text class="cluster-label label-b svelte-cvsk4a" x="228" y="87" text-anchor="middle" font-size="9" fill="#10b981" opacity="0">story</text></svg></div> <p class="mt-4 text-xs text-primary-400 italic text-center svelte-cvsk4a"> </p></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-3 svelte-cvsk4a"> </h2> <div class="space-y-3 text-sm text-primary-600 leading-relaxed svelte-cvsk4a"><p class="svelte-cvsk4a"> </p> <p class="svelte-cvsk4a"> </p> <p class="svelte-cvsk4a"> </p></div>  <!> <div class="mt-5 bg-primary-50 rounded-lg py-5 px-2 svelte-cvsk4a" aria-hidden="true"><svg class="network-illustration svelte-cvsk4a" viewBox="0 0 460 135" width="100%" preserveAspectRatio="xMidYMid meet"><!><line class="bline bline-you svelte-cvsk4a" stroke-width="1.5" stroke-dasharray="4 3" opacity="0"></line><!><!><circle class="bfeed bfeed-you svelte-cvsk4a" opacity="0"></circle><text class="blabel blabel-stories svelte-cvsk4a" x="420" y="60" text-anchor="start" font-size="8" fill="#6b7280" opacity="0"> </text><text class="blabel blabel-you svelte-cvsk4a" text-anchor="start" font-size="8" opacity="0"> </text></svg></div> <p class="mt-3 text-xs text-primary-400 italic text-center svelte-cvsk4a"> </p></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a"> </h2> <div class="grid sm:grid-cols-2 gap-4 svelte-cvsk4a"><div class="border border-primary-200 rounded-lg p-4 svelte-cvsk4a"><div class="flex items-center gap-2 mb-2 svelte-cvsk4a"><!> <h3 class="text-sm font-semibold text-primary svelte-cvsk4a"> </h3></div> <p class="text-xs text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div> <div class="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 svelte-cvsk4a"><div class="flex items-center gap-2 mb-2 svelte-cvsk4a"><!> <h3 class="text-sm font-semibold text-primary svelte-cvsk4a"> </h3></div> <p class="text-xs text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div></div></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a"> </h2> <div class="space-y-4 svelte-cvsk4a"><div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary mb-1 svelte-cvsk4a"> </h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary mb-1 svelte-cvsk4a"> </h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a"> </p></div></div></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a"> </h2> <ul class="space-y-3 svelte-cvsk4a"><li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a"><!> <span class="svelte-cvsk4a"> </span></li></ul></section> <section class="reveal-section text-center pt-4 svelte-cvsk4a"><button class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-base svelte-cvsk4a"> <span class="text-lg svelte-cvsk4a">&rarr;</span></button></section> <div class="text-center text-xs text-primary-400 pt-2 svelte-cvsk4a"><a href="https://github.com/kagisearch/kite-public" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-primary-600 svelte-cvsk4a"><!> kagisearch/kite-public <!></a></div></div></div>`);

export default function ContributeOnboarding($$anchor, $$props) {
	$.push($$props, true);

	// Svelte action: fade-up elements when they scroll into view
	function reveal(node) {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.classList.add('revealed');
						observer.unobserve(node);
					}
				}
			},
			{ threshold: 0.1, rootMargin: '-20px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	// Bipartite flow animation — feeds (left) → story clusters (right)
	const BIP_FEEDS = [
		{ x: 30, y: 8, r: 4, color: '#6366f1', story: 0 },
		{ x: 75, y: 18, r: 4.5, color: '#8b5cf6', story: 0 },
		{ x: 22, y: 32, r: 4, color: '#818cf8', story: 0 },
		{ x: 85, y: 40, r: 4, color: '#a78bfa', story: 1 },
		{ x: 35, y: 54, r: 4.5, color: '#7c3aed', story: 1 },
		{ x: 78, y: 58, r: 4, color: '#4f46e5', story: 1 },
		{ x: 28, y: 74, r: 4, color: '#c084fc', story: 2 },
		{ x: 72, y: 78, r: 4.5, color: '#6366f1', story: 1 },
		{ x: 22, y: 94, r: 4, color: '#818cf8', story: 2 },
		{ x: 82, y: 104, r: 4, color: '#a78bfa', story: 2 }
	];

	const BIP_STORIES = [
		{ x: 395, y: 20, r: 8, color: '#3b82f6' },
		{ x: 385, y: 58, r: 10, color: '#10b981' },
		{ x: 400, y: 98, r: 8, color: '#06b6d4' }
	];

	const BIP_YOU = { x: 50, y: 120, r: 5, color: '#f59e0b', story: 1 };

	// Precompute feed→story connection lines
	const BIP_LINES = BIP_FEEDS.map((feed, i) => {
		const story = BIP_STORIES[feed.story];
		const dx = story.x - feed.x;
		const dy = story.y - feed.y;

		return {
			index: i,
			x1: feed.x,
			y1: feed.y,
			x2: story.x,
			y2: story.y,
			length: Math.ceil(Math.sqrt(dx * dx + dy * dy)),
			color: feed.color
		};
	});

	const BIP_YOU_LINE = (() => {
		const story = BIP_STORIES[BIP_YOU.story];
		const dx = story.x - BIP_YOU.x;
		const dy = story.y - BIP_YOU.y;

		return {
			x1: BIP_YOU.x,
			y1: BIP_YOU.y,
			x2: story.x,
			y2: story.y,
			length: Math.ceil(Math.sqrt(dx * dx + dy * dy))
		};
	})();

	function buildNetworkCSS() {
		const dur = 12;
		let css = '';
		const feedStart = (i) => 4 + i * 2.5;
		const lineStart = (i) => feedStart(i) + 2;
		const lineDrawEnd = (i) => lineStart(i) + 10;
		const youStart = 42;
		const holdEnd = 65;
		const fadeEnd = 80;

		// Feed node keyframes (pop in staggered)
		for (let i = 0; i < BIP_FEEDS.length; i++) {
			const s = feedStart(i);

			css += `@keyframes bf${i}{0%,${s}%{transform:scale(0);opacity:0}${s + 2}%{transform:scale(1.3);opacity:.8}${s + 3}%{transform:scale(1);opacity:.7}${holdEnd}%{transform:scale(1);opacity:.7}${fadeEnd}%,100%{transform:scale(0);opacity:0}}`;
		}

		// Line drawing keyframes (stroke-dashoffset from length to 0)
		for (let i = 0; i < BIP_LINES.length; i++) {
			const s = lineStart(i);
			const e = lineDrawEnd(i);
			const len = BIP_LINES[i].length;

			css += `@keyframes bl${i}{0%,${s}%{stroke-dashoffset:${len};opacity:0}${s + 1}%{opacity:.2}${e}%{stroke-dashoffset:0;opacity:.25}${holdEnd}%{stroke-dashoffset:0;opacity:.25}${fadeEnd}%{opacity:0}100%{stroke-dashoffset:${len};opacity:0}}`;
		}

		// Story node keyframes — appear when first connected line starts arriving
		const storyFirstFeed = [0, 3, 6];

		for (const si of [0, 2]) {
			const appear = lineDrawEnd(storyFirstFeed[si]) - 3;
			const full = appear + 8;

			css += `@keyframes bs${si}{0%,${appear}%{transform:scale(0);opacity:0}${full}%{transform:scale(1);opacity:.6}${holdEnd}%{transform:scale(1);opacity:.6}${fadeEnd}%,100%{transform:scale(0);opacity:0}}`;
		}

		// Story 1 — extra pulse when "you" connects
		const s1Appear = lineDrawEnd(storyFirstFeed[1]) - 3;

		const s1Full = s1Appear + 8;
		const youLineArrival = youStart + 10;

		css += `@keyframes bs1{0%,${s1Appear}%{transform:scale(0);opacity:0}${s1Full}%{transform:scale(1);opacity:.6}${youLineArrival}%{transform:scale(1);opacity:.6}${youLineArrival + 2}%{transform:scale(1.3);opacity:.8}${youLineArrival + 4}%{transform:scale(1.1);opacity:.7}${holdEnd}%{transform:scale(1.1);opacity:.7}${fadeEnd}%,100%{transform:scale(0);opacity:0}}`;

		// "You" node keyframe
		css += `@keyframes bf-you{0%,${youStart}%{transform:scale(0);opacity:0}${youStart + 2}%{transform:scale(1.5);opacity:1}${youStart + 4}%{transform:scale(1);opacity:.9}${holdEnd}%{transform:scale(1);opacity:.9}${fadeEnd}%,100%{transform:scale(0);opacity:0}}`;

		// "You" line (simple fade — stroke-dasharray used for visual dashing)
		const yls = youStart + 3;

		css += `@keyframes bl-you{0%,${yls}%{opacity:0}${yls + 3}%{opacity:.35}${holdEnd}%{opacity:.35}${fadeEnd}%,100%{opacity:0}}`;

		// Labels
		const lblStart = lineDrawEnd(0) - 2;

		css += `@keyframes blbl-stories{0%,${lblStart}%{opacity:0}${lblStart + 4}%{opacity:.6}${holdEnd}%{opacity:.6}${fadeEnd}%,100%{opacity:0}}`;
		css += `@keyframes blbl-you{0%,${youStart + 3}%{opacity:0}${youStart + 6}%{opacity:.8}${holdEnd}%{opacity:.8}${fadeEnd}%,100%{opacity:0}}`;

		// Class → animation assignments
		for (let i = 0; i < BIP_FEEDS.length; i++) {
			css += `.bfeed-${i}{animation:bf${i} ${dur}s ease-out infinite}`;
		}

		for (let i = 0; i < BIP_LINES.length; i++) {
			css += `.bline-${i}{animation:bl${i} ${dur}s ease-out infinite}`;
		}

		for (let i = 0; i < BIP_STORIES.length; i++) {
			css += `.bstory-${i}{animation:bs${i} ${dur}s ease-out infinite}`;
		}

		css += `.bfeed-you{animation:bf-you ${dur}s ease-out infinite}`;
		css += `.bline-you{animation:bl-you ${dur}s ease-out infinite}`;
		css += `.blabel-stories{animation:blbl-stories ${dur}s ease-out infinite}`;
		css += `.blabel-you{animation:blbl-you ${dur}s ease-out infinite}`;

		return css;
	}

	const networkCSS = buildNetworkCSS();
	var div = root_2();
	var button = $.child(div);
	var text = $.only_child(button);
	var header = $.sibling(button, 2);
	var h1 = $.sibling($.child(header), 2);
	var text_1 = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_2 = $.only_child(p, true);

	$.reset(header);

	var div_1 = $.sibling(header, 2);
	var section = $.child(div_1);
	var h2 = $.child(section);
	var text_3 = $.only_child(h2, true);
	var div_2 = $.sibling(h2, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 2);
	var h3 = $.child(div_4);
	var text_4 = $.only_child(h3, true);
	var p_1 = $.sibling(h3, 2);
	var text_5 = $.only_child(p_1, true);

	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var h3_1 = $.child(div_6);
	var text_6 = $.only_child(h3_1, true);
	var p_2 = $.sibling(h3_1, 2);
	var text_7 = $.only_child(p_2, true);

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var h3_2 = $.child(div_8);
	var text_8 = $.only_child(h3_2, true);
	var p_3 = $.sibling(h3_2, 2);
	var text_9 = $.only_child(p_3, true);

	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_2);

	var p_4 = $.sibling(div_2, 4);
	var text_10 = $.only_child(p_4, true);

	$.reset(section);
	$.action(section, ($$node) => reveal?.($$node));

	var section_1 = $.sibling(section, 4);
	var h2_1 = $.child(section_1);
	var text_11 = $.only_child(h2_1, true);
	var div_9 = $.sibling(h2_1, 2);
	var p_5 = $.child(div_9);
	var text_12 = $.only_child(p_5, true);
	var p_6 = $.sibling(p_5, 2);
	var text_13 = $.only_child(p_6, true);
	var p_7 = $.sibling(p_6, 2);
	var text_14 = $.only_child(p_7, true);

	$.reset(div_9);

	var node_1 = $.sibling(div_9, 2);

	$.html(node_1, () => `<style>${networkCSS}</style>`);

	var div_10 = $.sibling(node_1, 2);
	var svg = $.child(div_10);
	var node_2 = $.child(svg);

	$.each(node_2, 17, () => BIP_LINES, $.index, ($$anchor, line) => {
		var line_1 = root();

		$.template_effect(() => {
			$.set_class(line_1, 0, `bline bline-${$.get(line).index ?? ''}`, 'svelte-cvsk4a');
			$.set_attribute(line_1, 'x1', $.get(line).x1);
			$.set_attribute(line_1, 'y1', $.get(line).y1);
			$.set_attribute(line_1, 'x2', $.get(line).x2);
			$.set_attribute(line_1, 'y2', $.get(line).y2);
			$.set_attribute(line_1, 'stroke', $.get(line).color);
			$.set_attribute(line_1, 'stroke-dasharray', $.get(line).length);
		});

		$.append($$anchor, line_1);
	});

	var line_2 = $.sibling(node_2);
	var node_3 = $.sibling(line_2);

	$.each(node_3, 17, () => BIP_STORIES, $.index, ($$anchor, story, i) => {
		var circle = root_1();

		$.set_class(circle, 0, `bstory bstory-${i}`, 'svelte-cvsk4a');

		$.template_effect(() => {
			$.set_attribute(circle, 'cx', $.get(story).x);
			$.set_attribute(circle, 'cy', $.get(story).y);
			$.set_attribute(circle, 'r', $.get(story).r);
			$.set_attribute(circle, 'fill', $.get(story).color);
		});

		$.append($$anchor, circle);
	});

	var node_4 = $.sibling(node_3);

	$.each(node_4, 17, () => BIP_FEEDS, $.index, ($$anchor, feed, i) => {
		var circle_1 = root_1();

		$.set_class(circle_1, 0, `bfeed bfeed-${i}`, 'svelte-cvsk4a');

		$.template_effect(() => {
			$.set_attribute(circle_1, 'cx', $.get(feed).x);
			$.set_attribute(circle_1, 'cy', $.get(feed).y);
			$.set_attribute(circle_1, 'r', $.get(feed).r);
			$.set_attribute(circle_1, 'fill', $.get(feed).color);
		});

		$.append($$anchor, circle_1);
	});

	var circle_2 = $.sibling(node_4);
	var text_15 = $.sibling(circle_2);
	var text_16 = $.only_child(text_15, true);
	var text_17 = $.sibling(text_15);
	var text_18 = $.only_child(text_17, true);

	$.reset(svg);
	$.reset(div_10);

	var p_8 = $.sibling(div_10, 2);
	var text_19 = $.only_child(p_8, true);

	$.reset(section_1);
	$.action(section_1, ($$node) => reveal?.($$node));

	var section_2 = $.sibling(section_1, 4);
	var h2_2 = $.child(section_2);
	var text_20 = $.only_child(h2_2, true);
	var div_11 = $.sibling(h2_2, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var node_5 = $.child(div_13);

	IconServer(node_5, { size: 16, class: 'text-blue-500' });

	var h3_3 = $.sibling(node_5, 2);
	var text_21 = $.only_child(h3_3, true);

	$.reset(div_13);

	var p_9 = $.sibling(div_13, 2);
	var text_22 = $.only_child(p_9, true);

	$.reset(div_12);

	var div_14 = $.sibling(div_12, 2);
	var div_15 = $.child(div_14);
	var node_6 = $.child(div_15);

	IconUsers(node_6, { size: 16, class: 'text-blue-600 dark:text-blue-400' });

	var h3_4 = $.sibling(node_6, 2);
	var text_23 = $.only_child(h3_4, true);

	$.reset(div_15);

	var p_10 = $.sibling(div_15, 2);
	var text_24 = $.only_child(p_10, true);

	$.reset(div_14);
	$.reset(div_11);
	$.reset(section_2);
	$.action(section_2, ($$node) => reveal?.($$node));

	var section_3 = $.sibling(section_2, 4);
	var h2_3 = $.child(section_3);
	var text_25 = $.only_child(h2_3, true);
	var div_16 = $.sibling(h2_3, 2);
	var div_17 = $.child(div_16);
	var h3_5 = $.child(div_17);
	var text_26 = $.only_child(h3_5, true);
	var p_11 = $.sibling(h3_5, 2);
	var text_27 = $.only_child(p_11, true);

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var h3_6 = $.child(div_18);
	var text_28 = $.only_child(h3_6, true);
	var p_12 = $.sibling(h3_6, 2);
	var text_29 = $.only_child(p_12, true);

	$.reset(div_18);
	$.reset(div_16);
	$.reset(section_3);
	$.action(section_3, ($$node) => reveal?.($$node));

	var section_4 = $.sibling(section_3, 4);
	var h2_4 = $.child(section_4);
	var text_30 = $.only_child(h2_4, true);
	var ul = $.sibling(h2_4, 2);
	var li = $.child(ul);
	var node_7 = $.child(li);

	IconRss(node_7, { size: 15, class: 'shrink-0 mt-0.5 text-blue-500' });

	var span = $.sibling(node_7, 2);
	var text_31 = $.only_child(span, true);

	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_8 = $.child(li_1);

	IconCheck(node_8, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });

	var span_1 = $.sibling(node_8, 2);
	var text_32 = $.only_child(span_1, true);

	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var node_9 = $.child(li_2);

	IconCheck(node_9, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });

	var span_2 = $.sibling(node_9, 2);
	var text_33 = $.only_child(span_2, true);

	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var node_10 = $.child(li_3);

	IconCheck(node_10, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });

	var span_3 = $.sibling(node_10, 2);
	var text_34 = $.only_child(span_3, true);

	$.reset(li_3);

	var li_4 = $.sibling(li_3, 2);
	var node_11 = $.child(li_4);

	IconFilter(node_11, { size: 15, class: 'shrink-0 mt-0.5 text-amber-500' });

	var span_4 = $.sibling(node_11, 2);
	var text_35 = $.only_child(span_4, true);

	$.reset(li_4);

	var li_5 = $.sibling(li_4, 2);
	var node_12 = $.child(li_5);

	IconX(node_12, { size: 15, class: 'shrink-0 mt-0.5 text-red-400' });

	var span_5 = $.sibling(node_12, 2);
	var text_36 = $.only_child(span_5, true);

	$.reset(li_5);

	var li_6 = $.sibling(li_5, 2);
	var node_13 = $.child(li_6);

	IconRss(node_13, { size: 15, class: 'shrink-0 mt-0.5 text-blue-500' });

	var span_6 = $.sibling(node_13, 2);
	var text_37 = $.only_child(span_6, true);

	$.reset(li_6);
	$.reset(ul);
	$.reset(section_4);
	$.action(section_4, ($$node) => reveal?.($$node));

	var section_5 = $.sibling(section_4, 2);
	var button_1 = $.child(section_5);
	var text_38 = $.child(button_1);

	$.next();
	$.reset(button_1);
	$.reset(section_5);
	$.action(section_5, ($$node) => reveal?.($$node));

	var div_19 = $.sibling(section_5, 2);
	var a = $.child(div_19);
	var node_14 = $.child(a);

	IconBrandGithub(node_14, { size: 13 });

	var node_15 = $.sibling(node_14, 2);

	IconExternalLink(node_15, { size: 11 });
	$.reset(a);
	$.reset(div_19);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		(
			$0,
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17,
			$18,
			$19,
			$20,
			$21,
			$22,
			$23,
			$24,
			$25,
			$26,
			$27,
			$28,
			$29,
			$30,
			$31,
			$32,
			$33,
			$34,
			$35,
			$36
		) => {
			$.set_text(text, `${$0 ?? ''} →`);
			$.set_text(text_1, $1);
			$.set_text(text_2, $2);
			$.set_text(text_3, $3);
			$.set_text(text_4, $4);
			$.set_text(text_5, $5);
			$.set_text(text_6, $6);
			$.set_text(text_7, $7);
			$.set_text(text_8, $8);
			$.set_text(text_9, $9);
			$.set_text(text_10, $10);
			$.set_text(text_11, $11);
			$.set_text(text_12, $12);
			$.set_text(text_13, $13);
			$.set_text(text_14, $14);
			$.set_attribute(line_2, 'x1', BIP_YOU_LINE.x1);
			$.set_attribute(line_2, 'y1', BIP_YOU_LINE.y1);
			$.set_attribute(line_2, 'x2', BIP_YOU_LINE.x2);
			$.set_attribute(line_2, 'y2', BIP_YOU_LINE.y2);
			$.set_attribute(line_2, 'stroke', BIP_YOU.color);
			$.set_attribute(circle_2, 'cx', BIP_YOU.x);
			$.set_attribute(circle_2, 'cy', BIP_YOU.y);
			$.set_attribute(circle_2, 'r', BIP_YOU.r);
			$.set_attribute(circle_2, 'fill', BIP_YOU.color);
			$.set_text(text_16, $15);
			$.set_attribute(text_17, 'x', BIP_YOU.x + 12);
			$.set_attribute(text_17, 'y', BIP_YOU.y + 3);
			$.set_attribute(text_17, 'fill', BIP_YOU.color);
			$.set_text(text_18, $16);
			$.set_text(text_19, $17);
			$.set_text(text_20, $18);
			$.set_text(text_21, $19);
			$.set_text(text_22, $20);
			$.set_text(text_23, $21);
			$.set_text(text_24, $22);
			$.set_text(text_25, $23);
			$.set_text(text_26, $24);
			$.set_text(text_27, $25);
			$.set_text(text_28, $26);
			$.set_text(text_29, $27);
			$.set_text(text_30, $28);
			$.set_text(text_31, $29);
			$.set_text(text_32, $30);
			$.set_text(text_33, $31);
			$.set_text(text_34, $32);
			$.set_text(text_35, $33);
			$.set_text(text_36, $34);
			$.set_text(text_37, $35);
			$.set_text(text_38, `${$36 ?? ''} `);
		},
		[
			() => s('contribute.onboarding.skip'),
			() => s('contribute.onboarding.title'),
			() => s('contribute.onboarding.subtitle'),
			() => s('contribute.onboarding.pipeline.title'),
			() => s('contribute.onboarding.pipeline.step1.title'),
			() => s('contribute.onboarding.pipeline.step1.description'),
			() => s('contribute.onboarding.pipeline.step2.title'),
			() => s('contribute.onboarding.pipeline.step2.description'),
			() => s('contribute.onboarding.pipeline.step3.title'),
			() => s('contribute.onboarding.pipeline.step3.description'),
			() => s('contribute.onboarding.pipeline.note'),
			() => s('contribute.onboarding.community.title'),
			() => s('contribute.onboarding.community.description'),
			() => s('contribute.onboarding.community.whyXnotY'),
			() => s('contribute.onboarding.community.noStories'),
			() => s('contribute.onboarding.community.networkLabelStories'),
			() => s('contribute.onboarding.community.networkLabelYou'),
			() => s('contribute.onboarding.community.networkNote'),
			() => s('contribute.onboarding.feedTypes.title'),
			() => s('contribute.onboarding.feedTypes.core.title'),
			() => s('contribute.onboarding.feedTypes.core.description'),
			() => s('contribute.onboarding.feedTypes.community.title'),
			() => s('contribute.onboarding.feedTypes.community.description'),
			() => s('contribute.onboarding.whatToDo.title'),
			() => s('contribute.onboarding.whatToDo.existing.title'),
			() => s('contribute.onboarding.whatToDo.existing.description'),
			() => s('contribute.onboarding.whatToDo.new.title'),
			() => s('contribute.onboarding.whatToDo.new.description'),
			() => s('contribute.onboarding.guidelines.title'),
			() => s('contribute.onboarding.guidelines.rssOnly'),
			() => s('contribute.onboarding.guidelines.working'),
			() => s('contribute.onboarding.guidelines.quality'),
			() => s('contribute.onboarding.guidelines.anyLanguage'),
			() => s('contribute.onboarding.guidelines.topicSpecific'),
			() => s('contribute.onboarding.guidelines.noLanguageSplit'),
			() => s('contribute.onboarding.guidelines.minimum'),
			() => s('contribute.onboarding.cta')
		]
	);

	$.delegated('click', button, function (...$$args) {
		$$props.onComplete?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		$$props.onComplete?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);