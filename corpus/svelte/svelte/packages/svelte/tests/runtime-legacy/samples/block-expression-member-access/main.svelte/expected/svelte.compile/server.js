import * as $ from 'svelte/internal/server';

function snip($$renderer) {}

export default function Main($$renderer) {
	let count1 = 1;
	let count2 = 1;

	function fn(ret) {
		if (count1 > 100) return ret;

		count1++;
		count2++;

		return ret;
	}

	const obj = {
		get true() {
			return fn(true);
		},

		get false() {
			return fn(false);
		},

		get array() {
			return fn([]);
		},

		get string() {
			return fn('');
		},

		get promise() {
			return fn(Promise.resolve());
		},

		get snippet() {
			return fn(snip);
		},

		get attachment() {
			return fn(() => {});
		}
	};

	if (obj.false) {
		$$renderer.push('<!--[0-->');
	} else if (obj.true) {
		$$renderer.push('<!--[1-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(obj.array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];

		$$renderer.push(`<!---->${$.escape((x, ''))}`);
	}

	$$renderer.push(`<!--]--> <!---->`);

	{}

	$$renderer.push(`<!----> `);
	$.await($$renderer, obj.promise, () => {}, () => {});
	$$renderer.push(`<!--]--> `);
	obj.snippet($$renderer);
	$$renderer.push(`<!----> ${$.html(obj.string)} <div></div> <!---->`);

	{
		const x = obj.string;

		$$renderer.push(`${$.escape(x)}`);
	}

	$$renderer.push(`<!----> <button>inc</button> ${$.escape(count1)} - ${$.escape(count2)}`);
}