<div class="root">
	<p class="a">a</p>
	<span data-x="1 2">b</span>
	<a href="#x">c</a>
</div>

<style>
	@layer base, components;

	@layer base {
		@supports (display: grid) {
			@media (min-width: 1px) {
				.root {
					display: grid;
				}
			}
		}
	}

	@property --angle {
		syntax: '<angle>';
		inherits: false;
		initial-value: 0deg;
	}

	@font-face {
		font-family: 'X';
		src: local('X');
	}

	.root {
		& .a {
			color: red;

			&:hover {
				color: blue;
			}
		}

		&:has(> .a) {
			outline: 1px solid;
		}
	}

	:is(.root, .other) :where(.a, .b) {
		margin: 0;
	}

	[data-x~='1'] {
		font-weight: bold;
	}

	a[href^='#']::after {
		content: ' (anchor)';
	}

	:global(.outside) .a {
		padding: 0;
	}

	.a:not(:global(.excluded)) {
		border: 0;
	}
</style>
