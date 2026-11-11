<script>
  let x = 'red';
</script>

<div style="{`color: ${x}`} color: blue">template inline then static dupe</div>
<div style="{`margin: ${x}; margin: 0`} color: blue">dupe inside one template, same set</div>
