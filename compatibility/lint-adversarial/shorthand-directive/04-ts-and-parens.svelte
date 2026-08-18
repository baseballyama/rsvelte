<script lang="ts">
	let active: unknown = true;
	let color = 'red';
</script>

<div class:active={active as boolean}>a</div>
<div class:active={(active)}>b</div>
<div style:color={(color)}>c</div>
