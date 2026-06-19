#!/usr/bin/env node
/**
 * Benchmark comparison between Rust and JS Svelte compilers.
 */

import { compile } from "../../submodules/svelte/packages/svelte/src/compiler/index.js";
import { performance } from "perf_hooks";

// Generate synthetic large file (same as Rust benchmark)
function createLargeSyntheticFile() {
  let source = `<script>
    let count = $state(0);
    let doubled = $derived(count * 2);
    function increment() { count++; }
</script>

`;

  for (let i = 0; i < 100; i++) {
    source += `<div class="item-${i}">
    <span>Item ${i}: {count}</span>
    {#if count > ${i}}
        <strong>Active</strong>
    {:else}
        <em>Inactive</em>
    {/if}
</div>
`;
  }

  return source;
}

// Small test file
const smallSource = `<script>
    let count = $state(0);
</script>
<button onclick={() => count++}>{count}</button>`;

// Large test file
const largeSource = createLargeSyntheticFile();

console.log("=== Svelte Compiler Performance Comparison ===\n");
console.log(`Small file size: ${smallSource.length} bytes`);
console.log(`Large file size: ${largeSource.length} bytes\n`);

// Warmup
for (let i = 0; i < 3; i++) {
  compile(smallSource, { generate: "client" });
  compile(largeSource, { generate: "client" });
}

// Benchmark function
function benchmark(name, source, iterations = 100) {
  const clientTimes = [];
  const serverTimes = [];

  for (let i = 0; i < iterations; i++) {
    // Client compilation
    const clientStart = performance.now();
    compile(source, { generate: "client" });
    clientTimes.push(performance.now() - clientStart);

    // Server compilation
    const serverStart = performance.now();
    compile(source, { generate: "server" });
    serverTimes.push(performance.now() - serverStart);
  }

  // Calculate statistics
  const clientMean = clientTimes.reduce((a, b) => a + b, 0) / iterations;
  const serverMean = serverTimes.reduce((a, b) => a + b, 0) / iterations;

  clientTimes.sort((a, b) => a - b);
  serverTimes.sort((a, b) => a - b);

  const clientMedian = clientTimes[Math.floor(iterations / 2)];
  const serverMedian = serverTimes[Math.floor(iterations / 2)];

  const clientMin = clientTimes[0];
  const serverMin = serverTimes[0];

  console.log(`--- ${name} ---`);
  console.log(
    `  Client: mean=${clientMean.toFixed(3)}ms, median=${clientMedian.toFixed(3)}ms, min=${clientMin.toFixed(3)}ms`,
  );
  console.log(
    `  Server: mean=${serverMean.toFixed(3)}ms, median=${serverMedian.toFixed(3)}ms, min=${serverMin.toFixed(3)}ms`,
  );
  console.log(
    `  Throughput (client): ${(source.length / 1024 / 1024 / (clientMean / 1000)).toFixed(2)} MiB/s`,
  );
  console.log(
    `  Throughput (server): ${(source.length / 1024 / 1024 / (serverMean / 1000)).toFixed(2)} MiB/s`,
  );

  return { clientMean, serverMean, clientMedian, serverMedian };
}

console.log("JavaScript (Official Svelte Compiler):");
console.log("");

const smallJS = benchmark("Small file", smallSource, 100);
const largeJS = benchmark("Large file (synthetic)", largeSource, 50);

console.log("\n=== Summary ===");
console.log("\nJavaScript Compiler (ms):");
console.log(`  Small client: ${smallJS.clientMean.toFixed(3)}ms`);
console.log(`  Small server: ${smallJS.serverMean.toFixed(3)}ms`);
console.log(`  Large client: ${largeJS.clientMean.toFixed(3)}ms`);
console.log(`  Large server: ${largeJS.serverMean.toFixed(3)}ms`);

console.log("\nRust Compiler (from criterion benchmarks):");
console.log("  Small client (bind-and-spread-precedence): ~33µs = 0.033ms");
console.log("  Small server (bind-and-spread-precedence): ~34µs = 0.034ms");
console.log("  Large client (synthetic-large): ~11.6ms");
console.log("  Large server (synthetic-large): ~2.7ms");

console.log("\n=== Speedup Ratios (estimated) ===");
console.log(`  Small client: ${(smallJS.clientMean / 0.033).toFixed(1)}x faster`);
console.log(`  Small server: ${(smallJS.serverMean / 0.034).toFixed(1)}x faster`);
console.log(`  Large client: ${(largeJS.clientMean / 11.6).toFixed(1)}x faster`);
console.log(`  Large server: ${(largeJS.serverMean / 2.7).toFixed(1)}x faster`);
