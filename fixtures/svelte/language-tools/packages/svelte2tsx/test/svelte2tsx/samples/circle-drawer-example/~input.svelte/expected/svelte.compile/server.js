import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let i = 0;
	let undoStack = [[]];
	let circles = [];
	let selected;
	let adjusting = false;
	let adjusted = false;

	function handleClick(event) {
		if (adjusting) {
			adjusting = false;

			// if circle was adjusted,
			// push to the stack
			if (adjusted) push();

			return;
		}

		const circle = { cx: event.clientX, cy: event.clientY, r: 50 };

		circles = circles.concat(circle);
		selected = circle;
		push();
	}

	function adjust(event) {
		selected.r = +event.target.value;
		circles = circles;
		adjusted = true;
	}

	function select(circle, event) {
		if (!adjusting) {
			event.stopPropagation();
			selected = circle;
		}
	}

	function push() {
		const newUndoStack = undoStack.slice(0, ++i);

		newUndoStack.push(clone(circles));
		undoStack = newUndoStack;
	}

	function travel(d) {
		circles = clone(undoStack[i += d]);
		adjusting = false;
	}

	function clone(circles) {
		return circles.map(({ cx, cy, r }) => ({ cx, cy, r }));
	}

	$$renderer.push(`<div class="controls svelte-cnhafb"><button${$.attr('disabled', i === 0, true)}>undo</button> <button${$.attr('disabled', i === undoStack.length - 1, true)}>redo</button></div> <svg class="svelte-cnhafb"><!--[-->`);

	const each_array = $.ensure_array_like(circles);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let circle = each_array[$$index];

		$$renderer.push(`<circle${$.attr('cx', circle.cx)}${$.attr('cy', circle.cy)}${$.attr('r', circle.r)}${$.attr('fill', circle === selected ? '#ccc' : 'white')} class="svelte-cnhafb"></circle>`);
	}

	$$renderer.push(`<!--]--></svg> `);

	if (adjusting) {
		$$renderer.push(`<!--[0--><div class="adjuster svelte-cnhafb"><p>adjust diameter of circle at ${$.escape(selected.cx)}, ${$.escape(selected.cy)}</p> <input type="range"${$.attr('value', selected.r)} class="svelte-cnhafb"/></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}