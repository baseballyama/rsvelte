<script>
	let { class: klass = '', for: htmlFor = '', default: dflt = 1, ...rest } = $props();
	const _ = 3;
	const $ = 4;
	const abc = 5;
	const ᱍ = 6;
	let 日本語 = $state(7);
</script>

{#snippet default_()}
	<i>snippet named like a keyword</i>
{/snippet}

<div class={klass} for={htmlFor}>{dflt} {_} {$} {abc} {ᱍ} {日本語}</div>
<p>{Object.keys(rest).length}</p>
{@render default_()}
