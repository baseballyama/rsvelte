<script>
	let { focus = false, a = true } = $props();
	let s = $state(true);
</script>
<input autofocus={focus} />
<input autofocus />
<input autofocus={true} />
<textarea autofocus={s}></textarea>
<div><input autofocus={a} value="x" /></div>
<input {...{ a }} autofocus={focus} />
