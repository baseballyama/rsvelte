import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import ColorValue from './ColorValue.svelte';
import { playSound } from '$lib/utils/audio';

var root = $.from_html(`<button class="ln-hero-code-value ln-hero-code-value--bool"> </button>`);
var root_1 = $.from_html(`<span class="ln-hero-code-value ln-hero-code-value--number" role="slider" tabindex="-1"> </span>`);

export default function EditableValue($$anchor, $$props) {
	$.push($$props, true);

	let min = $.prop($$props, 'min', 3, 0),
		max = $.prop($$props, 'max', 3, 1),
		step = $.prop($$props, 'step', 3, 0.01);

	function formatValue(val, s) {
		if (s >= 1) return String(Math.round(val));

		const d = Math.max(0, Math.ceil(-Math.log10(s)));

		return val.toFixed(d);
	}

	let numEl = $.state(void 0);

	onMount(() => {
		const el = $.get(numEl);

		if (!el || $$props.type !== 'number') return;

		const onWheel = (e) => {
			e.preventDefault();

			const v = $$props.value;
			const dir = e.deltaY < 0 ? 1 : -1;
			let next = v + dir * step();

			next = Math.round(next / step()) * step();

			const clamped = Math.max(min(), Math.min(max(), next));

			if (clamped !== v) playSound('tick', 0.25, 60);

			$$props.onChange(clamped);
		};

		el.addEventListener('wheel', onWheel, { passive: false });

		return () => el.removeEventListener('wheel', onWheel);
	});

	function handlePointerDown(e) {
		e.preventDefault();

		const startX = e.clientX;
		const startVal = $$props.value;
		let moved = false;
		let lastVal = startVal;

		document.body.style.cursor = 'ew-resize';
		document.body.style.userSelect = 'none';

		const onMove = (ev) => {
			const dx = ev.clientX - startX;

			if (!moved && Math.abs(dx) > 2) moved = true;
			if (!moved) return;

			const sens = ev.shiftKey ? 0.02 : 0.15;
			let next = startVal + dx * step() * sens;

			next = Math.round(next / step()) * step();

			const clamped = Math.max(min(), Math.min(max(), next));

			if (clamped !== lastVal) playSound('tick', 0.25, 60);

			lastVal = clamped;
			$$props.onChange(clamped);
		};

		const onUp = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};

		document.addEventListener('pointermove', onMove);
		document.addEventListener('pointerup', onUp);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ColorValue($$anchor, {
				get value() {
					return $$props.value;
				},
				onChange: (v) => $$props.onChange(v)
			});
		};

		var consequent_1 = ($$anchor) => {
			var button = root();
			var text = $.only_child(button, true);

			$.template_effect(($0) => $.set_text(text, $0), [() => String($$props.value)]);

			$.delegated('click', button, () => {
				playSound('toggle');
				$$props.onChange(!$$props.value);
			});

			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var span = root_1();
			var text_1 = $.only_child(span, true);

			$.bind_this(span, ($$value) => $.set(numEl, $$value), () => $.get(numEl));

			$.template_effect(
				($0) => {
					$.set_attribute(span, 'aria-valuenow', $$props.value);
					$.set_attribute(span, 'aria-valuemin', min());
					$.set_attribute(span, 'aria-valuemax', max());
					$.set_text(text_1, $0);
				},
				[() => formatValue($$props.value, step())]
			);

			$.delegated('pointerdown', span, handlePointerDown);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.type === 'color') $$render(consequent); else if ($$props.type === 'boolean') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'pointerdown']);