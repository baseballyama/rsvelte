<script>
function f() {
  try { let dup = 1; return dup; }
  finally { let dup = 2; return dup; }
}
f();
</script>