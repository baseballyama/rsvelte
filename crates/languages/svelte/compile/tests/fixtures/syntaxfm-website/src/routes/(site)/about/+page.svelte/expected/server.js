import * as $ from 'svelte/internal/server';
import HostSocialLink from '$lib/hosts/HostSocialLink.svelte';
import { fly } from 'svelte/transition';
import emo from '$assets/emo.jpg';
import bboy from '$assets/bboy.jpg';
import number1fan from '$assets/kaitlin.jpg';
import runonlove from '$assets/runonlove.jpg';
import cj from '$assets/cj.jpg';
import niki from '$assets/niki.jpeg';
import komatsu from '$assets/komatsu.jpeg';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let since_start = Date.now() - 1499256000000;
		let interval;
		let digits = $.derived(() => since_start.toString().split(''));
		let { data } = $$props;

		$$renderer.push(`<main${$.attr_style('', { 'margin-bottom': '2rem' })}><div${$.attr_style('', { 'margin-bottom': '2rem' })}><h1 class="h3 lines">About Syntax</h1> <p>Syntax is a Podcast about Web Development.</p> <p>Started by Wes and Scott in 2017 <span class="time text-xs svelte-1xhdrad">( <!--[-->`);

		const each_array = $.ensure_array_like(Array.from({ length: digits().length }, (_, i) => i));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let i = each_array[$$index];

			$$renderer.push(`<span class="slot svelte-1xhdrad"><!---->`);

			{
				$$renderer.push(`<span class="svelte-1xhdrad">${$.escape(digits().at(i))}</span>`);
			}

			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]--> milliseconds ago to be exact)</span>, Syntax has published
			${$.escape(data.count)} podcast episodes on full-stack web development, covering JavaScript Server + Client,
			the latest Frameworks, HTML, CSS, databases, deployment environments, and a whole lot more!</p> <p>You should listen! It's pretty good.</p></div> <div class="grid"><div class="team-member svelte-1xhdrad"><img${$.attr('src', `https://github.com/${hosts.wes.github}.png`)}${$.attr('alt', hosts.wes.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', emo)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Wes</span> <span class="last svelte-1xhdrad">Bos</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.wes });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">Wes Bos is co-host of Syntax and a <a href="https://wesbos.com">web development educator</a>. Constantly learning, he creates web development courses focused on JavaScript,
					TypeScript, React, CSS, Node.js and whatever else comes his way.</p></div></div> <div class="team-member svelte-1xhdrad"${$.attr_style('', { '--rotate': '0.2deg' })}><img${$.attr('src', `https://github.com/${hosts.scott.github}.png`)}${$.attr('alt', hosts.scott.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', bboy)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Scott</span> <span class="last svelte-1xhdrad">Tolinski</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.scott });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">Scott Tolinski is co-host of Syntax and the creator of <a href="https://leveluptutorials.com">Level Up Tutorials</a>. In his free time Scott is a dedicated Bboy (breakdancer) &amp; enjoys pushing himself
					athletically through dance, working out and snowboarding.</p></div></div> <div class="team-member svelte-1xhdrad"><img${$.attr('src', `https://github.com/${hosts.kaitlin.github}.png`)}${$.attr('alt', hosts.kaitlin.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', number1fan)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Kaitlin</span> <span class="last svelte-1xhdrad">Bloom</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.kaitlin });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">Kaitlin Bloom is Syntax's digital marketing manager. She publishes the Syntax Newsletter,
					manages the Syntax social accounts, and generally tries to figure out how Syntax can
					better reach its audience.</p></div></div> <div class="team-member svelte-1xhdrad"${$.attr_style('', { '--rotate': '1deg' })}><img${$.attr('src', `https://github.com/${hosts.randy.github}.png`)}${$.attr('alt', hosts.randy.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', runonlove)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Randy</span> <span class="last svelte-1xhdrad">Rektor</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.randy });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">Randy Rektor is Syntax's producer. He edits the episodes, produces the videos for YouTube,
					and helps keep Syntax's production gears oiled. He is a musician, <a href="https://www.youtube.com/@randyrektor">YouTuber</a>, and a self-proclaimed ‘massive audio geek’.</p></div></div> <div class="team-member svelte-1xhdrad"${$.attr_style('', { '--rotate': '1deg' })}><img${$.attr('src', `https://github.com/${hosts.cj.github}.png`)}${$.attr('alt', hosts.cj.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', cj)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">CJ</span> <span class="last svelte-1xhdrad">Reynolds</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.cj });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">CJ is a Senior Creator at Syntax and the host of <a href="https://coding.garden/">Coding Garden</a>. In his spare time CJ enjoys skateboarding, playing board games, collecting VHS tapes
					and hanging out with his dog.</p></div></div> <div class="team-member svelte-1xhdrad"${$.attr_style('', { '--rotate': '-0.5deg' })}><img${$.attr('src', niki)}${$.attr('alt', hosts.niki.name)} class="avatar svelte-1xhdrad"${$.attr('data-lol', komatsu)} onload="this.__e=event" onerror="this.__e=event"/> <h2 class="h4 svelte-1xhdrad"><span class="first svelte-1xhdrad">Niki</span> <span class="last svelte-1xhdrad">Brandner</span></h2> <div class="desc border-on-dark svelte-1xhdrad">`);

		HostSocialLink($$renderer, { host: hosts.niki });

		$$renderer.push(`<!----> <p class="svelte-1xhdrad">Niki Brandner is an Amsterdam-based video and audio engineer who studied at SAE Amsterdam.
					From fine-tuning podcasts and editing videos to preparing promotional material, mixing,
					and mastering music, she's passionate about making content sound and look its best.</p></div></div></div></main>`);
	});
}