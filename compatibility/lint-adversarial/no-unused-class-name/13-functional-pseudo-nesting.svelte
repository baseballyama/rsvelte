<div class="a b c d e f g">x</div>

<style>
	:is(.a) {
		color: red;
	}
	:where(.b, .zz) {
		color: red;
	}
	div:has(> .c) {
		color: red;
	}
	:not(.d) {
		color: red;
	}
	:global(.e .f) {
		color: red;
	}
	:is(:where(:not(.g))) {
		color: red;
	}
</style>
