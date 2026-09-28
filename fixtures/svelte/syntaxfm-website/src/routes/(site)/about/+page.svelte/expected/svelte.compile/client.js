import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';
import { fly } from 'svelte/transition';
import emo from '$assets/emo.jpg';
import bboy from '$assets/bboy.jpg';
import number1fan from '$assets/kaitlin.jpg';
import runonlove from '$assets/runonlove.jpg';
import cj from '$assets/cj.jpg';
import niki from '$assets/niki.jpeg';
import komatsu from '$assets/komatsu.jpeg';

var root = $.from_html(`<span class="svelte-1xhdrad"> </span>`);
var root_1 = $.from_html(`<span class="slot svelte-1xhdrad"><!></span>`);

var root_2 = $.from_html(`<main><div><h1 class="h3 lines">About Syntax</h1> <p>Syntax is a Podcast about Web Development.</p> <p>Started by Wes and Scott in 2017 <span class="time text-xs svelte-1xhdrad">( <!> milliseconds ago to be exact)</span> </p> <p>You should listen! It's pretty good.</p></div> <div class="grid"><div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Wes</span> <span class="last svelte-1xhdrad">Bos</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">Wes Bos is co-host of Syntax and a <a href="https://wesbos.com">web development educator</a>. Constantly learning, he creates web development courses focused on JavaScript,
					TypeScript, React, CSS, Node.js and whatever else comes his way.</p></div></div> <div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Scott</span> <span class="last svelte-1xhdrad">Tolinski</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">Scott Tolinski is co-host of Syntax and the creator of <a href="https://leveluptutorials.com">Level Up Tutorials</a>. In his free time Scott is a dedicated Bboy (breakdancer) & enjoys pushing himself
					athletically through dance, working out and snowboarding.</p></div></div> <div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Kaitlin</span> <span class="last svelte-1xhdrad">Bloom</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">Kaitlin Bloom is Syntax's digital marketing manager. She publishes the Syntax Newsletter,
					manages the Syntax social accounts, and generally tries to figure out how Syntax can
					better reach its audience.</p></div></div> <div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Randy</span> <span class="last svelte-1xhdrad">Rektor</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">Randy Rektor is Syntax's producer. He edits the episodes, produces the videos for YouTube,
					and helps keep Syntax's production gears oiled. He is a musician, <a href="https://www.youtube.com/@randyrektor">YouTuber</a>, and a self-proclaimed ‘massive audio geek’.</p></div></div> <div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">CJ</span> <span class="last svelte-1xhdrad">Reynolds</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">CJ is a Senior Creator at Syntax and the host of <a href="https://coding.garden/">Coding Garden</a>. In his spare time CJ enjoys skateboarding, playing board games, collecting VHS tapes
					and hanging out with his dog.</p></div></div> <div class="team-member svelte-1xhdrad"><img class="avatar svelte-1xhdrad"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Niki</span> <span class="last svelte-1xhdrad">Brandner</span></h2> <div class="desc border-on-dark svelte-1xhdrad"><!> <p class="svelte-1xhdrad">Niki Brandner is an Amsterdam-based video and audio engineer who studied at SAE Amsterdam.
					From fine-tuning podcasts and editing videos to preparing promotional material, mixing,
					and mastering music, she's passionate about making content sound and look its best.</p></div></div></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let hosts = {
		wes: { name: 'Wes Bos', github: 'wesbos', twitter: 'wesbos' },
		scott: {
			name: 'Scott Tolinski',
			github: 'stolinski',
			twitter: 'stolinski'
		},
		kaitlin: {
			name: 'Kaitlin Bloom',
			github: 'bl0om',
			twitter: 'kaitlinblooom'
		},
		randy: {
			name: 'Randy Rektor',
			github: 'randyrektor',
			twitter: 'randyrektor'
		},
		cj: {
			name: 'CJ Reynolds',
			github: 'w3cj',
			twitter: 'coding_garden'
		},
		niki: { name: 'Niki Brandner' }
	};

	const lol = function (node) {
		const src = node.getAttribute('src');
		const swapper = node.dataset.lol;

		function swap() {
			const toSwap = node.getAttribute('src') === src ? swapper : src;

			if (!swapper || !toSwap) return;

			node.setAttribute('src', toSwap);
		}

		// the node has been mounted in the DOM
		node.addEventListener('pointerenter', swap);

		node.addEventListener('pointerleave', swap);

		return {
			destroy() {
				node.removeEventListener('pointerenter', swap);
				node.removeEventListener('pointerleave', swap);
			}
		};
	};

	const speed = 169;
	let since_start = $.state(Date.now() - 1499256000000);
	let interval;

	$.user_effect(() => {
		interval = setInterval(
			() => {
				$.set(since_start, Date.now() - 1499256000000);
			},
			500
		);

		return () => clearInterval(interval);
	});

	let digits = $.derived(() => $.get(since_start).toString().split(''));
	var main = root_2();

	$.set_style(main, '', {}, { 'margin-bottom': '2rem' });

	var div = $.child(main);

	$.set_style(div, '', {}, { 'margin-bottom': '2rem' });

	var p = $.sibling($.child(div), 4);
	var span = $.sibling($.child(p));
	var node_1 = $.sibling($.child(span));

	$.each(node_1, 17, () => Array.from({ length: $.get(digits).length }, (_, i) => i), $.index, ($$anchor, i) => {
		var span_1 = root_1();
		var node_2 = $.child(span_1);

		$.key(node_2, () => `${$.get(digits).at($.get(i))}-${$.get(i) + 1}`, ($$anchor) => {
			var span_2 = root();
			var text = $.only_child(span_2, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => $.get(digits).at($.get(i))]);
			$.transition(1, span_2, () => fly, () => ({ duration: speed, y: -15, delay: $.get(i) * 10 }));
			$.transition(2, span_2, () => fly, () => ({ duration: speed, y: 15, delay: $.get(i) * 10 }));
			$.append($$anchor, span_2);
		});

		$.reset(span_1);
		$.append($$anchor, span_1);
	});

	$.next();
	$.reset(span);

	var text_1 = $.sibling(span);

	$.reset(p);
	$.next(2);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var img = $.child(div_2);

	$.action(img, ($$node) => lol?.($$node));

	var div_3 = $.sibling(img, 4);
	var node_3 = $.child(div_3);

	HostSocialLink(node_3, {
		get host() {
			return hosts.wes;
		}
	});

	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);

	$.set_style(div_4, '', {}, { '--rotate': '0.2deg' });

	var img_1 = $.child(div_4);

	$.action(img_1, ($$node) => lol?.($$node));

	var div_5 = $.sibling(img_1, 4);
	var node_4 = $.child(div_5);

	HostSocialLink(node_4, {
		get host() {
			return hosts.scott;
		}
	});

	$.next(2);
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var img_2 = $.child(div_6);

	$.action(img_2, ($$node) => lol?.($$node));

	var div_7 = $.sibling(img_2, 4);
	var node_5 = $.child(div_7);

	HostSocialLink(node_5, {
		get host() {
			return hosts.kaitlin;
		}
	});

	$.next(2);
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);

	$.set_style(div_8, '', {}, { '--rotate': '1deg' });

	var img_3 = $.child(div_8);

	$.action(img_3, ($$node) => lol?.($$node));

	var div_9 = $.sibling(img_3, 4);
	var node_6 = $.child(div_9);

	HostSocialLink(node_6, {
		get host() {
			return hosts.randy;
		}
	});

	$.next(2);
	$.reset(div_9);
	$.reset(div_8);

	var div_10 = $.sibling(div_8, 2);

	$.set_style(div_10, '', {}, { '--rotate': '1deg' });

	var img_4 = $.child(div_10);

	$.action(img_4, ($$node) => lol?.($$node));

	var div_11 = $.sibling(img_4, 4);
	var node_7 = $.child(div_11);

	HostSocialLink(node_7, {
		get host() {
			return hosts.cj;
		}
	});

	$.next(2);
	$.reset(div_11);
	$.reset(div_10);

	var div_12 = $.sibling(div_10, 2);

	$.set_style(div_12, '', {}, { '--rotate': '-0.5deg' });

	var img_5 = $.child(div_12);

	$.action(img_5, ($$node) => lol?.($$node));

	var div_13 = $.sibling(img_5, 4);
	var node_8 = $.child(div_13);

	HostSocialLink(node_8, {
		get host() {
			return hosts.niki;
		}
	});

	$.next(2);
	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_1);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_1, `, Syntax has published
			${$$props.data.count ?? ''} podcast episodes on full-stack web development, covering JavaScript Server + Client,
			the latest Frameworks, HTML, CSS, databases, deployment environments, and a whole lot more!`);

		$.set_attribute(img, 'src', `https://github.com/${hosts.wes.github}.png`);
		$.set_attribute(img, 'alt', hosts.wes.name);
		$.set_attribute(img, 'data-lol', emo);
		$.set_attribute(img_1, 'src', `https://github.com/${hosts.scott.github}.png`);
		$.set_attribute(img_1, 'alt', hosts.scott.name);
		$.set_attribute(img_1, 'data-lol', bboy);
		$.set_attribute(img_2, 'src', `https://github.com/${hosts.kaitlin.github}.png`);
		$.set_attribute(img_2, 'alt', hosts.kaitlin.name);
		$.set_attribute(img_2, 'data-lol', number1fan);
		$.set_attribute(img_3, 'src', `https://github.com/${hosts.randy.github}.png`);
		$.set_attribute(img_3, 'alt', hosts.randy.name);
		$.set_attribute(img_3, 'data-lol', runonlove);
		$.set_attribute(img_4, 'src', `https://github.com/${hosts.cj.github}.png`);
		$.set_attribute(img_4, 'alt', hosts.cj.name);
		$.set_attribute(img_4, 'data-lol', cj);
		$.set_attribute(img_5, 'src', niki);
		$.set_attribute(img_5, 'alt', hosts.niki.name);
		$.set_attribute(img_5, 'data-lol', komatsu);
	});

	$.replay_events(img);
	$.replay_events(img_1);
	$.replay_events(img_2);
	$.replay_events(img_3);
	$.replay_events(img_4);
	$.replay_events(img_5);
	$.append($$anchor, main);
	$.pop();
}