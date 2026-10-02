<script>
  let { value = $bindable(), text = $bindable("x"), ...properties } = $props();
</script>

<button {...properties} onclick={() => value++}>{value}</button>
<p title={text}>{text}</p>
