import * as $ from "svelte/internal/server";
function lit($$renderer, p = 1) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
function unary($$renderer, p = -1) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
function litp($$renderer, p = 1) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
function arrowp($$renderer, p = (() => 1)) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
function arr($$renderer, p = [1, (2, 3)]) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
function obji($$renderer, p = { k: (1, 2) }) {
	$$renderer.push(`<span>${$.escape(p)}</span>`);
}
export default function Snippet_default_parentheses($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let obj = { a: { b: 1 } };
		let a = 1;
		let b = 2;
		let c = 3;
		let x = 4;
		let y = 5;
		function bare($$renderer, p = obj.a) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function cond($$renderer, p = obj.a ? 1 : 2) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function nested($$renderer, p = obj.a ? obj.a ? 1 : 2 : 3) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function seq($$renderer, p = (obj.a, obj.a)) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function one($$renderer, p = obj.a) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function two($$renderer, p = obj.a) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function condp($$renderer, p = a ? 1 : 2) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function logic($$renderer, p = a ?? (b || c)) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function seq3($$renderer, p = (a, b, c)) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function assign($$renderer, p = a = 1) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function memb($$renderer, p = obj.a.b) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function memb2($$renderer, p = obj.a) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function arrow($$renderer, p = (x) => y) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		function typeo($$renderer, p = typeof a) {
			$$renderer.push(`<span>${$.escape(p)}</span>`);
		}
		bare($$renderer);
		$$renderer.push(`<!---->`);
		lit($$renderer);
		$$renderer.push(`<!---->`);
		unary($$renderer);
		$$renderer.push(`<!---->`);
		cond($$renderer);
		$$renderer.push(`<!----> `);
		nested($$renderer);
		$$renderer.push(`<!---->`);
		seq($$renderer);
		$$renderer.push(`<!---->`);
		one($$renderer);
		$$renderer.push(`<!---->`);
		two($$renderer);
		$$renderer.push(`<!----> `);
		litp($$renderer);
		$$renderer.push(`<!---->`);
		arrowp($$renderer);
		$$renderer.push(`<!---->`);
		condp($$renderer);
		$$renderer.push(`<!---->`);
		logic($$renderer);
		$$renderer.push(`<!----> `);
		seq3($$renderer);
		$$renderer.push(`<!---->`);
		arr($$renderer);
		$$renderer.push(`<!---->`);
		obji($$renderer);
		$$renderer.push(`<!---->`);
		assign($$renderer);
		$$renderer.push(`<!----> `);
		memb($$renderer);
		$$renderer.push(`<!---->`);
		memb2($$renderer);
		$$renderer.push(`<!---->`);
		arrow($$renderer);
		$$renderer.push(`<!---->`);
		typeo($$renderer);
		$$renderer.push(`<!---->`);
	});
}
