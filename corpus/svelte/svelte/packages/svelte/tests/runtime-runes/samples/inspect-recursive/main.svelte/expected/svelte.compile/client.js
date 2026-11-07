import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>add</button> <ul></ul>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Rect {
		#x = $.state();

		get x() {
			return $.get(this.#x);
		}

		set x(value) {
			$.set(this.#x, value, true);
		}

		#y = $.state();

		get y() {
			return $.get(this.#y);
		}

		set y(value) {
			$.set(this.#y, value, true);
		}

		constructor(x, y) {
			this.x = x;
			this.y = y;
		}
	}

	class Node {
		#pos = $.state($.proxy({ x: 0, y: 0 }));

		get pos() {
			return $.get(this.#pos);
		}

		set pos(value) {
			$.set(this.#pos, value, true);
		}

		#rect = $.derived(() => new Rect(this.pos.x, this.pos.y));

		get rect() {
			return $.get(this.#rect);
		}

		set rect(value) {
			$.set(this.#rect, value);
		}

		constructor(pos) {
			this.pos = pos;
		}
	}

	const nodes = $.proxy([]);
	const rects = $.derived(() => nodes.map((n) => n.rect));

	;;

	var fragment = root_1();
	var button = $.first_child(fragment);
	var ul = $.sibling(button, 2);

	$.each(ul, 21, () => $.get(rects), $.index, ($$anchor, rect) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${$.get(rect).x ?? ''} - ${$.get(rect).y ?? ''}`));
		$.append($$anchor, li);
	});

	$.reset(ul);

	$.delegated('click', button, () => {
		nodes.push(new Node({
			x: Math.floor(Math.random() * 100),
			y: Math.floor(Math.random() * 100)
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);