<script>
	let a = $state(0);
	let check = $state(true);
</script>

<button onclick={() => a++}>a: {a}</button>

<input type="checkbox"
bind:checked={()=>check,
(v)=>{
	check = v;
}} />
