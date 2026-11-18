<p class="a">x</p>

<style>
	@charset "utf-8";
	@layer base, components;
	@layer base {
		.a { color: red; }
	}
	@container (min-width: 1px) {
		.a { color: blue; }
	}
	@supports (display: grid) and (not (display: inline-grid)) {
		.a { display: grid; }
	}
	@property --p {
		syntax: '<color>';
		inherits: false;
		initial-value: red;
	}
	@font-face {
		font-family: 'F';
		src: url('f.woff2') format('woff2');
	}
	.a::before { content: '}'; }
	.a::after { content: "{"; }
	.a { background: url("a}b.png"); }
	@media screen { @media (min-width: 1px) { .a { color: teal; } } }
</style>
