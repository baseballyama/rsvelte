import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="presentation"><!></div>`);
var root_1 = $.from_html(`<div><div role="button" tabindex="0"><div class="relative w-[100px] h-[80px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"><span class="absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px]"></span> <!> <div></div> <div></div></div></div></div>`);

export default function Folder($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, '#FF8A4C'),
		size = $.prop($$props, 'size', 3, 1),
		items = $.prop($$props, 'items', 19, () => []),
		className = $.prop($$props, 'class', 3, '');

	function darkenColor(hex, percent) {
		let c = hex.startsWith('#') ? hex.slice(1) : hex;

		if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');

		const n = parseInt(c, 16);

		let r = n >> 16 & 0xff,
			g = n >> 8 & 0xff,
			b = n & 0xff;

		r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
		g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
		b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
	}

	const maxItems = 3;

	const papers = $.derived(() => {
		const arr = (items() ?? []).slice(0, maxItems);

		while (arr.length < maxItems) arr.push(null);

		return arr;
	});

	let open = $.state(false);
	let paperOffsets = $.state($.proxy(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))));
	const folderBackColor = $.derived(() => darkenColor(color(), 0.08));
	const paper1 = $.derived(() => darkenColor('#ffffff', 0.1));
	const paper2 = $.derived(() => darkenColor('#ffffff', 0.05));
	const paper3 = '#ffffff';

	function handleClick() {
		const wasOpen = $.get(open);

		$.set(open, !$.get(open));

		if (wasOpen) $.set(paperOffsets, Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })), true);
	}

	function onPaperMove(e, i) {
		if (!$.get(open)) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		$.set(
			paperOffsets,
			$.get(paperOffsets).map((p, idx) => idx === i
				? { x: (e.clientX - cx) * 0.15, y: (e.clientY - cy) * 0.15 }
				: p),
			true
		);
	}

	function onPaperLeave(_e, i) {
		$.set(paperOffsets, $.get(paperOffsets).map((p, idx) => idx === i ? { x: 0, y: 0 } : p), true);
	}

	function getOpenTransform(i) {
		if (i === 0) return 'translate(-120%, -70%) rotate(-15deg)';
		if (i === 1) return 'translate(10%, -70%) rotate(15deg)';
		if (i === 2) return 'translate(-50%, -100%) rotate(5deg)';

		return '';
	}

	function paperSizeClasses(i, isOpen) {
		if (i === 0) return isOpen ? 'w-[70%] h-[80%]' : 'w-[70%] h-[80%]';
		if (i === 1) return isOpen ? 'w-[80%] h-[80%]' : 'w-[80%] h-[70%]';

		return isOpen ? 'w-[90%] h-[80%]' : 'w-[90%] h-[60%]';
	}

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var span = $.child(div_2);
	var node = $.sibling(span, 2);

	$.each(node, 17, () => $.get(papers), $.index, ($$anchor, item, i) => {
		var div_3 = root();
		var node_1 = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(item)));
				$.append($$anchor, text);
			};

			var consequent_1 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.snippet(node_2, () => $.get(item));
				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if (typeof $.get(item) === 'string') $$render(consequent); else if ($.get(item)) $$render(consequent_1, 1);
			});
		}

		$.reset(div_3);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_3, 1, `absolute z-20 bottom-[10%] left-1/2 transition-all duration-300 ease-in-out ${$0 ?? ''} ${!$.get(open)
					? 'transform -translate-x-1/2 translate-y-[10%] group-hover:translate-y-0'
					: 'hover:scale-110'}`);

				$.set_style(div_3, `background-color:${(i === 0 ? $.get(paper1) : i === 1 ? $.get(paper2) : paper3) ?? ''};border-radius:10px;${$1 ?? ''}`);
			},
			[
				() => paperSizeClasses(i, $.get(open)),
				() => $.get(open)
					? `transform:${getOpenTransform(i)} translate(${$.get(paperOffsets)[i].x}px, ${$.get(paperOffsets)[i].y}px);`
					: ''
			]
		);

		$.delegated('mousemove', div_3, (e) => onPaperMove(e, i));
		$.event('mouseleave', div_3, (e) => onPaperLeave(e, i));
		$.append($$anchor, div_3);
	});

	var div_4 = $.sibling(node, 2);
	var div_5 = $.sibling(div_4, 2);

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_style(div, `transform:scale(${size() ?? ''});`);
		$.set_class(div, 1, $.clsx(className()));
		$.set_class(div_1, 1, `group relative transition-all duration-200 ease-in cursor-pointer ${!$.get(open) ? 'hover:-translate-y-2' : ''}`);
		$.set_style(div_1, `transform:${$.get(open) ? 'translateY(-8px)' : 'none'};`);
		$.set_style(div_2, `background-color:${$.get(folderBackColor) ?? ''};`);
		$.set_style(span, `background-color:${$.get(folderBackColor) ?? ''};`);

		$.set_class(div_4, 1, `absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${!$.get(open)
			? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]'
			: ''}`);

		$.set_style(div_4, `background-color:${color() ?? ''};border-radius:5px 10px 10px 10px;${$.get(open) ? 'transform:skew(15deg) scaleY(0.6);' : ''}`);

		$.set_class(div_5, 1, `absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${!$.get(open)
			? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]'
			: ''}`);

		$.set_style(div_5, `background-color:${color() ?? ''};border-radius:5px 10px 10px 10px;${$.get(open) ? 'transform:skew(-15deg) scaleY(0.6);' : ''}`);
	});

	$.delegated('click', div_1, handleClick);

	$.delegated('keydown', div_1, (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown', 'mousemove']);