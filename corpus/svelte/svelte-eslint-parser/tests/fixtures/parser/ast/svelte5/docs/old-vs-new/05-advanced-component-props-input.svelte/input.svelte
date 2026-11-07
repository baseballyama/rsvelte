<script>
	let { class: classname, ...others } = $props();
</script>

<pre class={classname}>
	{JSON.stringify(others)}
</pre>
