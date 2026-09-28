import * as $ from 'svelte/internal/server';

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

export default function ContributeOnboarding($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onComplete } = $$props;

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

		$$renderer.push(`<div class="min-h-screen bg-app-bg svelte-cvsk4a"><button class="fixed top-5 right-5 z-10 text-sm text-primary-400 hover:text-primary-600 transition-colors svelte-cvsk4a">${$.escape(s('contribute.onboarding.skip'))} →</button> <header class="pt-16 pb-10 px-5 text-center hero-fade svelte-cvsk4a"><img src="/favicon.svg" alt="" class="w-14 h-14 mx-auto mb-5 svelte-cvsk4a"/> <h1 class="text-3xl md:text-4xl font-bold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.title'))}</h1> <p class="mt-2 text-base text-primary-600 max-w-lg mx-auto svelte-cvsk4a">${$.escape(s('contribute.onboarding.subtitle'))}</p></header> <div class="max-w-2xl mx-auto px-5 pb-20 space-y-12 svelte-cvsk4a"><section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-5 svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.title'))}</h2> <div class="space-y-6 svelte-cvsk4a"><div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">1</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step1.title'))}</h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step1.description'))}</p></div></div> <div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">2</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step2.title'))}</h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step2.description'))}</p></div></div> <div class="flex items-start gap-3 svelte-cvsk4a"><div class="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 svelte-cvsk4a">3</div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step3.title'))}</h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.step3.description'))}</p></div></div></div> <div class="mt-6 flex justify-center bg-primary-50 rounded-lg py-6 svelte-cvsk4a" aria-hidden="true"><svg class="clustering-illustration svelte-cvsk4a" viewBox="0 0 280 120" width="300" height="129"><circle class="dot dot-a1 svelte-cvsk4a" cx="30" cy="20" r="6" fill="#3b82f6" opacity="0.7"></circle><circle class="dot dot-a2 svelte-cvsk4a" cx="80" cy="90" r="6" fill="#6366f1" opacity="0.7"></circle><circle class="dot dot-a3 svelte-cvsk4a" cx="50" cy="55" r="6" fill="#8b5cf6" opacity="0.7"></circle><circle class="dot dot-a4 svelte-cvsk4a" cx="15" cy="70" r="5" fill="#a78bfa" opacity="0.6"></circle><circle class="dot dot-a5 svelte-cvsk4a" cx="75" cy="30" r="5" fill="#818cf8" opacity="0.6"></circle><circle class="dot dot-b1 svelte-cvsk4a" cx="200" cy="25" r="6" fill="#10b981" opacity="0.7"></circle><circle class="dot dot-b2 svelte-cvsk4a" cx="250" cy="80" r="6" fill="#14b8a6" opacity="0.7"></circle><circle class="dot dot-b3 svelte-cvsk4a" cx="220" cy="65" r="6" fill="#06b6d4" opacity="0.7"></circle><circle class="dot dot-b4 svelte-cvsk4a" cx="265" cy="35" r="5" fill="#34d399" opacity="0.6"></circle><circle class="dot dot-l1 svelte-cvsk4a" cx="140" cy="30" r="5" fill="#f59e0b" opacity="0.7"></circle><circle class="dot dot-l2 svelte-cvsk4a" cx="150" cy="100" r="5" fill="#ef4444" opacity="0.7"></circle><circle class="dot dot-l3 svelte-cvsk4a" cx="125" cy="70" r="4" fill="#f97316" opacity="0.6"></circle><circle class="cluster-ring ring-a svelte-cvsk4a" cx="55" cy="55" r="26" fill="none" stroke="#6366f1" stroke-width="1.5" opacity="0"></circle><circle class="cluster-ring ring-b svelte-cvsk4a" cx="228" cy="52" r="24" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0"></circle><text class="cluster-label label-a svelte-cvsk4a" x="55" y="92" text-anchor="middle" font-size="9" fill="#6366f1" opacity="0">story</text><text class="cluster-label label-b svelte-cvsk4a" x="228" y="87" text-anchor="middle" font-size="9" fill="#10b981" opacity="0">story</text></svg></div> <p class="mt-4 text-xs text-primary-400 italic text-center svelte-cvsk4a">${$.escape(s('contribute.onboarding.pipeline.note'))}</p></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-3 svelte-cvsk4a">${$.escape(s('contribute.onboarding.community.title'))}</h2> <div class="space-y-3 text-sm text-primary-600 leading-relaxed svelte-cvsk4a"><p class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.community.description'))}</p> <p class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.community.whyXnotY'))}</p> <p class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.community.noStories'))}</p></div>  ${$.html(`<style>${networkCSS}</style>`)} <div class="mt-5 bg-primary-50 rounded-lg py-5 px-2 svelte-cvsk4a" aria-hidden="true"><svg class="network-illustration svelte-cvsk4a" viewBox="0 0 460 135" width="100%" preserveAspectRatio="xMidYMid meet"><!--[-->`);

		const each_array = $.ensure_array_like(BIP_LINES);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let line = each_array[$$index];

			$$renderer.push(`<line${$.attr_class(`bline bline-${$.stringify(line.index)}`, 'svelte-cvsk4a')}${$.attr('x1', line.x1)}${$.attr('y1', line.y1)}${$.attr('x2', line.x2)}${$.attr('y2', line.y2)}${$.attr('stroke', line.color)} stroke-width="1"${$.attr('stroke-dasharray', line.length)} opacity="0"></line>`);
		}

		$$renderer.push(`<!--]--><line class="bline bline-you svelte-cvsk4a"${$.attr('x1', BIP_YOU_LINE.x1)}${$.attr('y1', BIP_YOU_LINE.y1)}${$.attr('x2', BIP_YOU_LINE.x2)}${$.attr('y2', BIP_YOU_LINE.y2)}${$.attr('stroke', BIP_YOU.color)} stroke-width="1.5" stroke-dasharray="4 3" opacity="0"></line><!--[-->`);

		const each_array_1 = $.ensure_array_like(BIP_STORIES);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let story = each_array_1[i];

			$$renderer.push(`<circle${$.attr_class(`bstory bstory-${$.stringify(i)}`, 'svelte-cvsk4a')}${$.attr('cx', story.x)}${$.attr('cy', story.y)}${$.attr('r', story.r)}${$.attr('fill', story.color)} opacity="0"></circle>`);
		}

		$$renderer.push(`<!--]--><!--[-->`);

		const each_array_2 = $.ensure_array_like(BIP_FEEDS);

		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let feed = each_array_2[i];

			$$renderer.push(`<circle${$.attr_class(`bfeed bfeed-${$.stringify(i)}`, 'svelte-cvsk4a')}${$.attr('cx', feed.x)}${$.attr('cy', feed.y)}${$.attr('r', feed.r)}${$.attr('fill', feed.color)} opacity="0"></circle>`);
		}

		$$renderer.push(`<!--]--><circle class="bfeed bfeed-you svelte-cvsk4a"${$.attr('cx', BIP_YOU.x)}${$.attr('cy', BIP_YOU.y)}${$.attr('r', BIP_YOU.r)}${$.attr('fill', BIP_YOU.color)} opacity="0"></circle><text class="blabel blabel-stories svelte-cvsk4a" x="420" y="60" text-anchor="start" font-size="8" fill="#6b7280" opacity="0">${$.escape(s('contribute.onboarding.community.networkLabelStories'))}</text><text class="blabel blabel-you svelte-cvsk4a"${$.attr('x', BIP_YOU.x + 12)}${$.attr('y', BIP_YOU.y + 3)} text-anchor="start" font-size="8"${$.attr('fill', BIP_YOU.color)} opacity="0">${$.escape(s('contribute.onboarding.community.networkLabelYou'))}</text></svg></div> <p class="mt-3 text-xs text-primary-400 italic text-center svelte-cvsk4a">${$.escape(s('contribute.onboarding.community.networkNote'))}</p></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a">${$.escape(s('contribute.onboarding.feedTypes.title'))}</h2> <div class="grid sm:grid-cols-2 gap-4 svelte-cvsk4a"><div class="border border-primary-200 rounded-lg p-4 svelte-cvsk4a"><div class="flex items-center gap-2 mb-2 svelte-cvsk4a">`);
		IconServer($$renderer, { size: 16, class: 'text-blue-500' });
		$$renderer.push(`<!----> <h3 class="text-sm font-semibold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.feedTypes.core.title'))}</h3></div> <p class="text-xs text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.feedTypes.core.description'))}</p></div> <div class="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 svelte-cvsk4a"><div class="flex items-center gap-2 mb-2 svelte-cvsk4a">`);
		IconUsers($$renderer, { size: 16, class: 'text-blue-600 dark:text-blue-400' });
		$$renderer.push(`<!----> <h3 class="text-sm font-semibold text-primary svelte-cvsk4a">${$.escape(s('contribute.onboarding.feedTypes.community.title'))}</h3></div> <p class="text-xs text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.feedTypes.community.description'))}</p></div></div></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a">${$.escape(s('contribute.onboarding.whatToDo.title'))}</h2> <div class="space-y-4 svelte-cvsk4a"><div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary mb-1 svelte-cvsk4a">${$.escape(s('contribute.onboarding.whatToDo.existing.title'))}</h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.whatToDo.existing.description'))}</p></div> <div class="svelte-cvsk4a"><h3 class="text-sm font-semibold text-primary mb-1 svelte-cvsk4a">${$.escape(s('contribute.onboarding.whatToDo.new.title'))}</h3> <p class="text-sm text-primary-600 leading-relaxed svelte-cvsk4a">${$.escape(s('contribute.onboarding.whatToDo.new.description'))}</p></div></div></section> <hr class="border-primary-200 svelte-cvsk4a"/> <section class="reveal-section svelte-cvsk4a"><h2 class="text-lg font-semibold text-primary mb-4 svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.title'))}</h2> <ul class="space-y-3 svelte-cvsk4a"><li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconRss($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-blue-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.rssOnly'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconCheck($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.working'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconCheck($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.quality'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconCheck($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-green-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.anyLanguage'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconFilter($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-amber-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.topicSpecific'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconX($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-red-400' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.noLanguageSplit'))}</span></li> <li class="flex items-start gap-2.5 text-sm text-primary-600 svelte-cvsk4a">`);
		IconRss($$renderer, { size: 15, class: 'shrink-0 mt-0.5 text-blue-500' });
		$$renderer.push(`<!----> <span class="svelte-cvsk4a">${$.escape(s('contribute.onboarding.guidelines.minimum'))}</span></li></ul></section> <section class="reveal-section text-center pt-4 svelte-cvsk4a"><button class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-base svelte-cvsk4a">${$.escape(s('contribute.onboarding.cta'))} <span class="text-lg svelte-cvsk4a">→</span></button></section> <div class="text-center text-xs text-primary-400 pt-2 svelte-cvsk4a"><a href="https://github.com/kagisearch/kite-public" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-primary-600 svelte-cvsk4a">`);
		IconBrandGithub($$renderer, { size: 13 });
		$$renderer.push(`<!----> kagisearch/kite-public `);
		IconExternalLink($$renderer, { size: 11 });
		$$renderer.push(`<!----></a></div></div></div>`);
	});
}