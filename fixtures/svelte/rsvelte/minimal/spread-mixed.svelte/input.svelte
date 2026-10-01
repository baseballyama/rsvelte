<script>
	let { class: className, ...rest } = $props();
	let count = $state(0);
	let active = $state(false);

	function extra() {
		return { 'data-extra': count };
	}

	function log() {
		console.log(count);
	}
</script>

<div {...rest} class={className} onclick={() => count++} data-count={count}>events</div>
<div {...extra()} class:active title="n {count}">memoized</div>
<p class="note" {...rest} onmouseenter={log} hidden>static</p>
<span {...{ role: 'status' }} aria-live="polite">{count}</span>
<button type="button" onclick={() => (active = !active)}>toggle</button>
