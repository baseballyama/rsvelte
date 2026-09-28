import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gsap } from 'gsap';

var root = $.from_html(`<div><svg class="absolute top-0 left-0 w-full h-full" aria-hidden="true"><defs><filter id="filter-noise-x"><feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="40"></feDisplacementMap></filter><filter id="filter-noise-y"><feTurbulence type="fractalNoise" baseFrequency="0.000001" numOctaves="1"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="40"></feDisplacementMap></filter></defs></svg> <div class="absolute w-full pointer-events-none opacity-0 transform translate-y-1/2"></div> <div class="absolute h-full pointer-events-none opacity-0 transform translate-x-1/2"></div></div>`);

export default function Crosshair($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, 'white'),
		container = $.prop($$props, 'containerRef', 3, null);

	let lineH;
	let lineV;
	let filterX;
	let filterY;

	$.user_effect(() => {
		const target = container() || window;
		const mouse = { x: 0, y: 0 };

		const getPos = (e) => {
			if (container()) {
				const b = container().getBoundingClientRect();

				return { x: e.clientX - b.left, y: e.clientY - b.top };
			}

			return { x: e.clientX, y: e.clientY };
		};

		const handleMove = (ev) => {
			const e = ev;
			const p = getPos(e);

			mouse.x = p.x;
			mouse.y = p.y;

			if (container()) {
				const b = container().getBoundingClientRect();
				const out = e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom;

				gsap.to([lineH, lineV], { opacity: out ? 0 : 1 });
			}
		};

		const rendered = {
			tx: { previous: 0, current: 0, amt: 0.15 },
			ty: { previous: 0, current: 0, amt: 0.15 }
		};

		gsap.set([lineH, lineV], { opacity: 0 });

		let raf = 0;

		const render = () => {
			rendered.tx.current = mouse.x;
			rendered.ty.current = mouse.y;
			rendered.tx.previous += (rendered.tx.current - rendered.tx.previous) * rendered.tx.amt;
			rendered.ty.previous += (rendered.ty.current - rendered.ty.previous) * rendered.ty.amt;
			gsap.set(lineV, { x: rendered.tx.previous });
			gsap.set(lineH, { y: rendered.ty.previous });
			raf = requestAnimationFrame(render);
		};

		const firstMove = (ev) => {
			const e = ev;
			const p = getPos(e);

			mouse.x = p.x;
			mouse.y = p.y;
			rendered.tx.previous = rendered.tx.current = mouse.x;
			rendered.ty.previous = rendered.ty.current = mouse.y;
			gsap.to([lineH, lineV], { duration: 0.9, ease: 'power3.out', opacity: 1 });
			raf = requestAnimationFrame(render);
			target.removeEventListener('mousemove', firstMove);
		};

		target.addEventListener('mousemove', handleMove);
		target.addEventListener('mousemove', firstMove);

		const prim = { turbulence: 0 };

		const tl = gsap.timeline({
			paused: true,
			onStart: () => {
				lineH.style.filter = 'url(#filter-noise-x)';
				lineV.style.filter = 'url(#filter-noise-y)';
			},

			onUpdate: () => {
				filterX?.setAttribute('baseFrequency', String(prim.turbulence));
				filterY?.setAttribute('baseFrequency', String(prim.turbulence));
			},

			onComplete: () => {
				lineH.style.filter = 'none';
				lineV.style.filter = 'none';
			}
		}).to(prim, {
			duration: 0.5,
			ease: 'power1',
			startAt: { turbulence: 1 },
			turbulence: 0
		});

		const enter = () => tl.restart();

		const leave = () => {
			tl.progress(1).kill();
		};

		const linksRoot = container() ?? document;
		const links = linksRoot.querySelectorAll('a');

		links.forEach((l) => {
			l.addEventListener('mouseenter', enter);
			l.addEventListener('mouseleave', leave);
		});

		return () => {
			cancelAnimationFrame(raf);
			target.removeEventListener('mousemove', handleMove);
			target.removeEventListener('mousemove', firstMove);

			links.forEach((l) => {
				l.removeEventListener('mouseenter', enter);
				l.removeEventListener('mouseleave', leave);
			});
		};
	});

	var div = root();
	var svg = $.child(div);
	var defs = $.child(svg);
	var filter = $.child(defs);
	var feTurbulence = $.child(filter);

	$.bind_this(feTurbulence, ($$value) => filterX = $$value, () => filterX);
	$.next();
	$.reset(filter);

	var filter_1 = $.sibling(filter);
	var feTurbulence_1 = $.child(filter_1);

	$.bind_this(feTurbulence_1, ($$value) => filterY = $$value, () => filterY);
	$.next();
	$.reset(filter_1);
	$.reset(defs);
	$.reset(svg);

	var div_1 = $.sibling(svg, 2);

	$.bind_this(div_1, ($$value) => lineH = $$value, () => lineH);

	var div_2 = $.sibling(div_1, 2);

	$.bind_this(div_2, ($$value) => lineV = $$value, () => lineV);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `${container() ? 'absolute' : 'fixed'} top-0 left-0 w-full h-full pointer-events-none z-[10000]`);
		$.set_style(div_1, `height:1px;background:${color() ?? ''};`);
		$.set_style(div_2, `width:1px;background:${color() ?? ''};`);
	});

	$.append($$anchor, div);
	$.pop();
}