<script>
function f(n) {
  switch (n) { case 1: { let leaked = 1; return leaked; } }
  let leaked = 2;
  return leaked;
}
f(0);
</script>