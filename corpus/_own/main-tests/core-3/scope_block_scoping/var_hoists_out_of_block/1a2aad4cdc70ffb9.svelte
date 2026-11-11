<script>
function f(cond) {
  if (cond) { var hoisted = 1; }
  return hoisted;
}
f(true);
</script>