<script>
	/* eslint svelte/html-closing-bracket-new-line: ["warn", { "selfClosingTag": { "singleline": "always" } }] */
	let s = 'x';
</script>

<br />

<img src={s} alt=""
/>

<div id="a">non-self-closing keeps outer defaults</div>
