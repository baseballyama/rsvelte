import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { gsap } from 'gsap';

var root = $.from_html(`<span class="handle"> </span>`);
var root_1 = $.from_html(`<span class="location"> </span>`);
var root_2 = $.from_html(`<article class="chroma-card" role="button" tabindex="0"><div class="chroma-img-wrapper"><img loading="lazy"/></div> <footer class="chroma-info"><h3 class="name"> </h3> <!> <p class="role"> </p> <!></footer></article>`);
var root_3 = $.from_html(`<div><!> <div class="chroma-overlay"></div> <div class="chroma-fade"></div></div>`);

export default function ChromaGrid($$anchor, $$props) {
	$.push($$props, true);

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

	let className = $.prop($$props, 'class', 3, ''),
		radius = $.prop($$props, 'radius', 3, 300),
		columns = $.prop($$props, 'columns', 3, 3),
		rows = $.prop($$props, 'rows', 3, 2),
		damping = $.prop($$props, 'damping', 3, 0.45),
		fadeOut = $.prop($$props, 'fadeOut', 3, 0.6),
		ease = $.prop($$props, 'ease', 3, 'power3.out');

	const data = $.derived(() => $$props.items?.length ? $$props.items : demo);
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
			duration: damping(),
			ease: ease(),
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
		gsap.to(fadeRef, { opacity: 1, duration: fadeOut(), overwrite: true });
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

	var div = root_3();
	var node = $.child(div);

	$.each(node, 17, () => $.get(data), $.index, ($$anchor, c) => {
		var article = root_2();
		var div_1 = $.child(article);
		var img = $.only_child(div_1);
		var footer = $.sibling(div_1, 2);
		var h3 = $.child(footer);
		var text = $.only_child(h3, true);
		var node_1 = $.sibling(h3, 2);

		{
			var consequent = ($$anchor) => {
				var span = root();
				var text_1 = $.only_child(span, true);

				$.template_effect(() => $.set_text(text_1, $.get(c).handle));
				$.append($$anchor, span);
			};

			$.if(node_1, ($$render) => {
				if ($.get(c).handle) $$render(consequent);
			});
		}

		var p = $.sibling(node_1, 2);
		var text_2 = $.only_child(p, true);
		var node_2 = $.sibling(p, 2);

		{
			var consequent_1 = ($$anchor) => {
				var span_1 = root_1();
				var text_3 = $.only_child(span_1, true);

				$.template_effect(() => $.set_text(text_3, $.get(c).location));
				$.append($$anchor, span_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(c).location) $$render(consequent_1);
			});
		}

		$.reset(footer);
		$.reset(article);

		$.template_effect(() => {
			$.set_style(article, `--card-border:${($.get(c).borderColor || 'transparent') ?? ''}; --card-gradient:${$.get(c).gradient ?? ''}; cursor:${$.get(c).url ? 'pointer' : 'default'};`);
			$.set_attribute(img, 'src', $.get(c).image);
			$.set_attribute(img, 'alt', $.get(c).title);
			$.set_text(text, $.get(c).title);
			$.set_text(text_2, $.get(c).subtitle);
		});

		$.delegated('mousemove', article, handleCardMove);
		$.delegated('click', article, () => handleCardClick($.get(c).url));

		$.delegated('keydown', article, (e) => {
			if (e.key === 'Enter') handleCardClick($.get(c).url);
		});

		$.append($$anchor, article);
	});

	var div_2 = $.sibling(node, 4);

	$.bind_this(div_2, ($$value) => fadeRef = $$value, () => fadeRef);
	$.reset(div);
	$.bind_this(div, ($$value) => rootRef = $$value, () => rootRef);

	$.template_effect(() => {
		$.set_class(div, 1, `chroma-grid ${className() ?? ''}`);
		$.set_style(div, `--r:${radius() ?? ''}px; --cols:${columns() ?? ''}; --rows:${rows() ?? ''};`);
	});

	$.delegated('pointermove', div, handleMove);
	$.event('pointerleave', div, handleLeave);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['pointermove', 'mousemove', 'click', 'keydown']);