<script>
  let { children, ...rest } = $props();
</script>

<div {...rest}>plain</div>
<section id="main" {...rest} title="after">ordered</section>
<button {...rest}>typed by the spread</button>
<img {...rest} alt="" />
