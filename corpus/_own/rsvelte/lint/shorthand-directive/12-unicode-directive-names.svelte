<script>
	let アクティブ = true;
	let 値 = 'v';
</script>

<div class:アクティブ={アクティブ}>class</div>
<input bind:value={値} />
<div class:アクティブ>already shorthand</div>
