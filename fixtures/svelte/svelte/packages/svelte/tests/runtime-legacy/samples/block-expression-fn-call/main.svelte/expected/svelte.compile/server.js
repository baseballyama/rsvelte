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

	if (fn(false)) {
		$$renderer.push('<!--[0-->');
	} else if (fn(true)) {
		$$renderer.push('<!--[1-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(fn([]));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];

		$$renderer.push(`<!---->${$.escape((x, ''))}`);
	}

	$$renderer.push(`<!--]--> <!---->`);

	{}

	$$renderer.push(`<!----> `);
	$.await($$renderer, fn(Promise.resolve()), () => {}, () => {});
	$$renderer.push(`<!--]--> `);
	fn(snip)($$renderer);
	$$renderer.push(`<!----> ${$.html(fn(''))} <div></div> <!---->`);

	{
		const x = fn('');

		$$renderer.push(`${$.escape(x)}`);
	}

	$$renderer.push(`<!----> <button${$.attr('data-foo', fn(true))}>${$.escape(fn('inc'))}</button> ${$.escape(count1)} - ${$.escape(count2)}`);
}