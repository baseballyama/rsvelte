import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

export default function ChromaGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const demo = [
			{
				image: 'https://i.pravatar.cc/300?img=8',
				title: 'Alex Rivera',
				subtitle: 'Full Stack Developer',
				handle: '@alexrivera',
				borderColor: '#FF8A4C',
				gradient: 'linear-gradient(145deg,#FF8A4C,#000)',
				url: 'https://github.com/'
			},

			{
				image: 'https://i.pravatar.cc/300?img=11',
				title: 'Jordan Chen',
				subtitle: 'DevOps Engineer',
				handle: '@jordanchen',
				borderColor: '#FFC18A',
				gradient: 'linear-gradient(210deg,#FFC18A,#000)',
				url: 'https://linkedin.com/in/'
			},

			{
				image: 'https://i.pravatar.cc/300?img=3',
				title: 'Morgan Blake',
				subtitle: 'UI/UX Designer',
				handle: '@morganblake',
				borderColor: '#FF6B2C',
				gradient: 'linear-gradient(165deg,#FF6B2C,#000)',
				url: 'https://dribbble.com/'
			},

			{
				image: 'https://i.pravatar.cc/300?img=16',
				title: 'Casey Park',
				subtitle: 'Data Scientist',
				handle: '@caseypark',
				borderColor: '#E86A2A',
				gradient: 'linear-gradient(195deg,#E86A2A,#000)',
				url: 'https://kaggle.com/'
			},

			{
				image: 'https://i.pravatar.cc/300?img=25',
				title: 'Sam Kim',
				subtitle: 'Mobile Developer',
				handle: '@thesamkim',
				borderColor: '#FF8A4C',
				gradient: 'linear-gradient(225deg,#FF8A4C,#000)',
				url: 'https://github.com/'
			},

			{
				image: 'https://i.pravatar.cc/300?img=60',
				title: 'Tyler Rodriguez',
				subtitle: 'Cloud Architect',
				handle: '@tylerrod',
				borderColor: '#FFA56B',
				gradient: 'linear-gradient(135deg,#FFA56B,#000)',
				url: 'https://aws.amazon.com/'
			}
		];

		let {
			items,
			class: className = '',
			radius = 300,
			columns = 3,
			rows = 2,
			damping = 0.45,
			fadeOut = 0.6,
			ease = 'power3.out'
		} = $$props;

		const data = $.derived(() => items?.length ? items : demo);
		let rootRef;
		let fadeRef;
		let setX = null;
		let setY = null;
		const pos = { x: 0, y: 0 };

		onMount(() => {
			setX = gsap.quickSetter(rootRef, '--x', 'px');
			setY = gsap.quickSetter(rootRef, '--y', 'px');

			const { width, height } = rootRef.getBoundingClientRect();

			pos.x = width / 2;
			pos.y = height / 2;
			setX(pos.x);
			setY(pos.y);
		});

		function moveTo(x, y) {
			gsap.to(pos, {
				x,
				y,
				duration: damping,
				ease,
				onUpdate: () => {
					setX?.(pos.x);
					setY?.(pos.y);
				},
				overwrite: true
			});
		}

		function handleMove(e) {
			const r = rootRef.getBoundingClientRect();

			moveTo(e.clientX - r.left, e.clientY - r.top);
			gsap.to(fadeRef, { opacity: 0, duration: 0.25, overwrite: true });
		}

		function handleLeave() {
			gsap.to(fadeRef, { opacity: 1, duration: fadeOut, overwrite: true });
		}

		function handleCardMove(e) {
			const c = e.currentTarget;
			const rect = c.getBoundingClientRect();

			c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
			c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
		}

		function handleCardClick(url) {
			if (url) window.open(url, '_blank', 'noopener,noreferrer');
		}

		$$renderer.push(`<div${$.attr_class(`chroma-grid ${$.stringify(className)}`)}${$.attr_style(`--r:${$.stringify(radius)}px; --cols:${$.stringify(columns)}; --rows:${$.stringify(rows)};`)}><!--[-->`);

		const each_array = $.ensure_array_like(data());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let c = each_array[i];

			$$renderer.push(`<article class="chroma-card" role="button" tabindex="0"${$.attr_style(`--card-border:${$.stringify(c.borderColor || 'transparent')}; --card-gradient:${$.stringify(c.gradient)}; cursor:${c.url ? 'pointer' : 'default'};`)}><div class="chroma-img-wrapper"><img${$.attr('src', c.image)}${$.attr('alt', c.title)} loading="lazy"/></div> <footer class="chroma-info"><h3 class="name">${$.escape(c.title)}</h3> `);

			if (c.handle) {
				$$renderer.push(`<!--[0--><span class="handle">${$.escape(c.handle)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="role">${$.escape(c.subtitle)}</p> `);

			if (c.location) {
				$$renderer.push(`<!--[0--><span class="location">${$.escape(c.location)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></footer></article>`);
		}

		$$renderer.push(`<!--]--> <div class="chroma-overlay"></div> <div class="chroma-fade"></div></div>`);
	});
}