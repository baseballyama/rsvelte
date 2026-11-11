<script>
	export let x;
	export let t;
</script>

{#if x === 'a b'}
	<p>1</p>
{:else if x === 'a  b'}
	<p>2</p>
{/if}

{#if t === `c d`}
	<p>3</p>
{:else if t === `c  d`}
	<p>4</p>
{/if}

{#if x === 'e && f'}
	<p>5</p>
{:else if x === 'e&&f'}
	<p>6</p>
{/if}
