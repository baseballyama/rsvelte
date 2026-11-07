import * as $ from 'svelte/internal/server';

export default function CurvedLoop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			marqueeText = '',
			speed = 2,
			class: className = '',
			curveAmount = 400,
			direction = 'left',
			interactive = true
		} = $$props;

		const text = $.derived(() => {
			const hasTrailing = (/\s|\u00A0$/).test(marqueeText);

			return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + ' ';
		});

		let measureEl = void 0;
		let textPathEl = void 0;
		let spacing = 0;
		let offset = 0;
		let isDragging = false;
		const pathId = `curve-${uid}`;
		const pathD = $.derived(() => `M-100,40 Q500,${40 + curveAmount} 1540,40`);
		let dragActive = false;
		let lastX = 0;
		let velX = 0;

		// svelte-ignore state_referenced_locally
		let dirInternal = direction;

		const totalText = $.derived(() => {
			const len = spacing;

			if (!len) return text();

			return Array(Math.ceil(1800 / len) + 2).fill(text()).join('');
		});

		const ready = $.derived(() => spacing > 0);

		function onPointerDown(e) {
			if (!interactive) return;

			dragActive = true;
			isDragging = true;
			lastX = e.clientX;
			velX = 0;
			e.target?.setPointerCapture?.(e.pointerId);
		}

		function onPointerMove(e) {
			if (!interactive || !dragActive || !textPathEl) return;

			const dx = e.clientX - lastX;

			lastX = e.clientX;
			velX = dx;

			const currentOffset = parseFloat(textPathEl.getAttribute('startOffset') || '0');
			let newOffset = currentOffset + dx;
			const wrapPoint = spacing;

			if (newOffset <= -wrapPoint) newOffset += wrapPoint;
			if (newOffset > 0) newOffset -= wrapPoint;

			textPathEl.setAttribute('startOffset', newOffset + 'px');
			offset = newOffset;
		}

		function endDrag() {
			if (!interactive) return;

			dragActive = false;
			isDragging = false;
			dirInternal = velX > 0 ? 'right' : 'left';
		}

		const cursorStyle = $.derived(() => interactive ? isDragging ? 'grabbing' : 'grab' : 'auto');

		$$renderer.push(`<div class="curved-loop-jacket svelte-h8hbnk"${$.attr_style('', {
			visibility: ready() ? 'visible' : 'hidden',
			cursor: cursorStyle()
		})}><svg class="curved-loop-svg svelte-h8hbnk" viewBox="0 0 1440 120"><text xml:space="preserve" style="visibility:hidden;opacity:0;pointer-events:none;">${$.escape(text())}</text><defs><path${$.attr('id', pathId)}${$.attr('d', pathD())} fill="none" stroke="transparent"></path></defs>`);

		if (ready()) {
			$$renderer.push(`<!--[0--><text font-weight="bold" xml:space="preserve"${$.attr_class($.clsx(className), 'svelte-h8hbnk')}><textPath${$.attr('href', `#${pathId}`)}${$.attr('startOffset', offset + 'px')} xml:space="preserve">${$.escape(totalText())}</textPath></text>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></svg></div>`);
	});
}