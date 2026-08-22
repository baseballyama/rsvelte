<script>
  let styles = 'color: red';
  let a = 'x';
</script>

<div style={styles}>whole-value expression</div>
<div style="{a} color: red">standalone interpolation then decl</div>
<div style="color: red; {a}">trailing standalone interpolation</div>
