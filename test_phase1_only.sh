#!/bin/bash
# Phase 1 パーサーの簡易テスト

echo "=== Phase 1 Parser Quality Test ==="
echo ""

# Test 1: Simple component parsing
echo "Test 1: Simple component parsing"
cat > /tmp/test_simple.svelte << 'EOF'
<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  Count: {count}
</button>
EOF

cargo run --example parse_only /tmp/test_simple.svelte 2>&1 | head -20
echo ""

# Test 2: TypeScript support
echo "Test 2: TypeScript support"
cat > /tmp/test_ts.svelte << 'EOF'
<script lang="ts">
  let count: number = 0;
  function increment(): void {
    count++;
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>
EOF

cargo run --example parse_only /tmp/test_ts.svelte 2>&1 | head -20
echo ""

# Test 3: Module script
echo "Test 3: Module script"
cat > /tmp/test_module.svelte << 'EOF'
<script context="module">
  export const title = "Test";
</script>

<script>
  let name = "World";
</script>

<h1>{title}: Hello {name}!</h1>
EOF

cargo run --example parse_only /tmp/test_module.svelte 2>&1 | head -20
echo ""

echo "=== Tests completed ==="
