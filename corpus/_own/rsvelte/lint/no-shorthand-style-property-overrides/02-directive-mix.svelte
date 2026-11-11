<script>
  let c = 'red';
</script>

<div style:background-color={c} style="background: green">directive then attr, flag</div>
<div style="background: green" style:background-color={c}>attr then directive, ok</div>
<div style:margin-top="1px" style:margin="0">two directives, flag</div>
