<script>
	let on = $state(true);
	let extra = $state('pad');
</script>

<div class={['base', on && 'lit', { dark: !on }, [extra, { deep: on }]]}>a</div>
<div class={{ solo: on, [extra]: !on }}>b</div>
<div class={on ? 'yes' : ['no', extra]} class:flag={on}>c</div>
<span class="static {extra}" class:flag={on} class:extra>{on}</span>
