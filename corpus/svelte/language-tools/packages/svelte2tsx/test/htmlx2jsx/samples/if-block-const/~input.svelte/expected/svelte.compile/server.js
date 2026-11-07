import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (name == "world") {
		$$renderer.push('<!--[0-->');

		const hello = name;

		$$renderer.push(`<h1>Hello ${$.escape(hello)}</h1>`);
	} else if (true) {
		$$renderer.push('<!--[1-->');

		const hello = name;

		$$renderer.push(`<h1>Hello ${$.escape(hello)}</h1>`);
	} else {
		$$renderer.push('<!--[-1-->');

		const hello = name;

		$$renderer.push(`<h1>Hello ${$.escape(hello)}</h1>`);
	}

	$$renderer.push(`<!--]--> `);

	if (typeof a === 'string') {
		$$renderer.push('<!--[0-->');

		const aStr = a;
		const aStr2 = aStr;

		$$renderer.push(`${$.escape(a)}`);
	} else if (typeof a === 'number') {
		$$renderer.push('<!--[1-->');

		const aNum = a;
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (typeof a === 'string') {
		$$renderer.push('<!--[0-->');

		const aStr = a;
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (typeof a === 'string') {
		$$renderer.push('<!--[0-->');

		const aStr = a;
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}