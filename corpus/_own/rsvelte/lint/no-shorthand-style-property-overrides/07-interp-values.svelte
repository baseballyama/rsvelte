<script>
  let a = '1px';
  let b = '0';
</script>

<div style="margin-top: {a}; margin: {b}">interp values, flag margin</div>
<div style="margin-top: {a}">single ok</div>
<div style="{a}: 1px; margin: 0">interp key then shorthand</div>
