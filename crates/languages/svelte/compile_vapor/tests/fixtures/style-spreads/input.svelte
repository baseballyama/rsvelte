<script>
  let active = $state(false);
  let attributes = $derived(active ? { id: 'styled', style: 'color:black;padding:2px;--base:ok' } : { id: 'styled', style: 'color:red;margin:1px' });
</script>
<button onclick={() => active = !active}>toggle</button>
<p {...attributes} title="value:{active}" style:color={active ? 'blue' : null} style:--gap|important={active ? '3px' : null}>styles</p>
<div {...attributes} style="color:green;padding:4px" style:color={active ? 'purple' : 'orange'}>order</div>
