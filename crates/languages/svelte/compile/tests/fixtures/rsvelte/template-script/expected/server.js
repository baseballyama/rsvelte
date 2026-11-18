import * as $ from "svelte/internal/server";
export default function Template_script($$renderer) {
	let v = 1;
	$.head("ae43zg", $$renderer, ($$renderer) => {
		$$renderer.push(`<script async="" src="https://x/y.js"${$.attr("data-v", v)}></script>`);
		$$renderer.push(` `);
		$$renderer.push(`<script>window.a = 1;</script>`);
	});
	$$renderer.push(`<div>`);
	$$renderer.push(`<script type="text/javascript">console.log("{v}");</script>`);
	$$renderer.push(` <p>after</p></div> <span>`);
	$$renderer.push(`<script src="/z.js"></script>`);
	$$renderer.push(`<!----></span> <div>`);
	$$renderer.push(`<style>p { color: red }</style>`);
	$$renderer.push(`<template><b>t</b></template></div> `);
	if (v) {
		$$renderer.push(`<!--[0--><script>a\`\${1}\\n</script>`);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push("<!--[-1-->");
	}
	$$renderer.push(`<!--]--> <span>`);
	$$renderer.push(`<script${$.attr("src", v)}></script>`);
	$$renderer.push(`<!----></span> <p>`);
	$$renderer.push(`<script></script>`);
	$$renderer.push(`<!----></p>`);
}
