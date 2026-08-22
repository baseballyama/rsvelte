<script>
  let props = $state({ id: "spread", class: "from-spread", title: "t" });
</script>

<div id="before" {...props}>a</div>
<div {...props} id="after">b</div>
<div {...props} {...props}>c</div>
<div id="x" {...props} class="y" {...props} title="z">d</div>
<input value="v" {...props} />
