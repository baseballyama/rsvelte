import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const object = Promise.resolve({ 'prop-1': 1, 'prop2': 2, 'prop-3': 3, 'prop4': 4 });
	const objectReject = Promise.reject({ 'prop-5': 5, 'prop6': 6, 'prop-7': 7, 'prop8': 8 });

	$.await($$renderer, object, () => {}, ({ 'prop-1': prop1, 'prop4': fourthProp, ...rest }) => {
		$$renderer.push(`<p>prop-1: ${$.escape(prop1)}</p> <p>prop4: ${$.escape(fourthProp)}</p> <p>rest: ${$.escape(JSON.stringify(rest))}</p>`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, objectReject, () => {}, (value) => {
		$$renderer.push(`resolved`);
	});

	$$renderer.push(`<!--]-->`);
}