import * as $ from 'svelte/internal/server';

class Things {
	tab = 'A';
	data = [{ no: 1 }, { no: 2 }];
	#list = $.derived(() => this.filter());

	get list() {
		return this.#list();
	}

	set list($$value) {
		return this.#list($$value);
	}

	filter() {
		this.tab;

		return this.data;
	}
}

const things = new Things();

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div><button>A</button> <button>B</button></div> <div>`);

		if (things.tab === 'A') {
			$$renderer.push(`<!--[0-->A`);
		} else {
			$$renderer.push(`<!--[-1-->B <!--[-->`);

			const each_array = $.ensure_array_like(things.list);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<!---->${$.escape(item.no)}`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}