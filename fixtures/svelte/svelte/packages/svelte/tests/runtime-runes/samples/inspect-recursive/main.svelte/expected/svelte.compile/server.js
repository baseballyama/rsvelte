import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Rect {
			x;
			y;

			constructor(x, y) {
				this.x = x;
				this.y = y;
			}
		}

		class Node {
			pos = { x: 0, y: 0 };
			#rect = $.derived(() => new Rect(this.pos.x, this.pos.y));

			get rect() {
				return this.#rect();
			}

			set rect($$value) {
				return this.#rect($$value);
			}

			constructor(pos) {
				this.pos = pos;
			}
		}

		const nodes = [];
		const rects = $.derived(() => nodes.map((n) => n.rect));

		;;
		$$renderer.push(`<button>add</button> <ul><!--[-->`);

		const each_array = $.ensure_array_like(rects());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let rect = each_array[$$index];

			$$renderer.push(`<li>${$.escape(rect.x)} - ${$.escape(rect.y)}</li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}