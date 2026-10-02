import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<circle class="svelte-cnhafb"></circle>`);
var root_1 = $.from_html(`<div class="adjuster svelte-cnhafb"><p> </p> <input type="range" class="svelte-cnhafb"/></div>`);
var root_2 = $.from_html(`<div class="controls svelte-cnhafb"><button>undo</button> <button>redo</button></div> <svg class="svelte-cnhafb"></svg> <!>`, 1);

export default function Input($$anchor) {
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

	var fragment = root_2();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var svg = $.sibling(div, 2);

	$.each(svg, 21, () => circles, $.index, ($$anchor, circle) => {
		var circle_1 = root();

		$.template_effect(() => {
			$.set_attribute(circle_1, 'cx', $.get(circle).cx);
			$.set_attribute(circle_1, 'cy', $.get(circle).cy);
			$.set_attribute(circle_1, 'r', $.get(circle).r);
			$.set_attribute(circle_1, 'fill', $.get(circle) === selected ? '#ccc' : 'white');
		});

		$.event('click', circle_1, (event) => select($.get(circle), event));

		$.event('contextmenu', circle_1, $.preventDefault($.stopPropagation(() => {
			adjusting = !adjusting;

			if (adjusting) selected = $.get(circle);
		})));

		$.append($$anchor, circle_1);
	});

	$.reset(svg);

	var node = $.sibling(svg, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();
			var p = $.child(div_1);
			var text = $.only_child(p);
			var input = $.sibling(p, 2);

			$.remove_input_defaults(input);
			$.reset(div_1);

			$.template_effect(() => {
				$.set_text(text, `adjust diameter of circle at ${selected.cx ?? ''}, ${selected.cy ?? ''}`);
				$.set_value(input, selected.r);
			});

			$.event('input', input, adjust);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (adjusting) $$render(consequent);
		});
	}

	$.template_effect(() => {
		button.disabled = i === 0;
		button_1.disabled = i === undoStack.length - 1;
	});

	$.event('click', button, () => travel(-1));
	$.event('click', button_1, () => travel(+1));
	$.event('click', svg, handleClick);
	$.append($$anchor, fragment);
}