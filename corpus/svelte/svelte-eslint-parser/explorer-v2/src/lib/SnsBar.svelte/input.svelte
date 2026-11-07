<script>
	import { onMount } from 'svelte';

	let timeoutId = null;

	/**
	 * setup
	 */
	function setup() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			(function (d, s, id) {
				const [fjs] = d.getElementsByTagName(s);
				if (d.getElementById(id)) {
					return;
				}
				const js = d.createElement(s);
				js.id = id;
				js.src = 'https://buttons.github.io/buttons.js';
				fjs.parentNode.insertBefore(js, fjs);
			})(document, 'script', 'gh-buttons');
		}, 500);
	}

	onMount(() => {
		setup();
	});
</script>

<div class="sns-bar" style:margin-left="auto">
	<div class="sns">
		<a
			class="github-button"
			href="https://github.com/sveltejs/svelte-eslint-parser"
			data-show-count="true"
			aria-label="Star sveltejs/svelte-eslint-parser on GitHub">Star</a
		>
		<a href="https://www.npmjs.com/package/svelte-eslint-parser">
			<img src="https://img.shields.io/npm/v/svelte-eslint-parser.svg" alt="npm" />
		</a>
	</div>
</div>

<style>
	.sns-bar {
		display: flex;
		align-items: flex-end;
		padding-left: 8px;
		padding-right: 8px;
	}
	.sns-bar .sns {
		display: flex;
		align-items: flex-start;
	}

	.sns-bar .sns > * {
		vertical-align: top !important;
		margin-left: 4px;
		height: 23px !important;
	}
</style>
