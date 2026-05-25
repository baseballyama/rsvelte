/*
 * rsvelte Java FFM smoke test.
 *
 * Requires JDK 22+ (FFM API finalized in java.lang.foreign).
 *
 * Run from the repository root:
 *   cargo build -p rsvelte_capi --release
 *   java --enable-native-access=ALL-UNNAMED \
 *        crates/rsvelte_capi/examples/java/Smoke.java
 *
 * This is a single-file source-launch program — `java Smoke.java`
 * compiles + runs in one shot (JEP 330) on modern JDKs.
 */

import java.lang.foreign.Arena;
import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.MemoryLayout;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.SymbolLookup;
import java.lang.foreign.ValueLayout;
import java.lang.invoke.MethodHandle;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;

public class Smoke {

    // RsvelteBuf { uint8_t* data; size_t len; size_t cap; }
    static final MemoryLayout BUF_LAYOUT = MemoryLayout.structLayout(
        ValueLayout.ADDRESS.withName("data"),
        ValueLayout.JAVA_LONG.withName("len"),
        ValueLayout.JAVA_LONG.withName("cap")
    );

    public static void main(String[] args) throws Throwable {
        Path repoRoot = Paths.get("").toAbsolutePath();
        Path dylib = repoRoot
            .resolve("target")
            .resolve("release")
            .resolve(dylibName());
        if (!dylib.toFile().exists()) {
            System.err.println("FAIL: dylib not found at " + dylib
                + " — run `cargo build -p rsvelte_capi --release` first");
            System.exit(2);
        }

        Linker linker = Linker.nativeLinker();
        SymbolLookup lib = SymbolLookup.libraryLookup(dylib, Arena.ofAuto());

        MethodHandle rsvelte_version = linker.downcallHandle(
            lib.find("rsvelte_version").orElseThrow(),
            FunctionDescriptor.of(ValueLayout.ADDRESS)
        );

        // void rsvelte_compile_into(const u8 *src, size_t src_len,
        //                           const u8 *opts, size_t opts_len,
        //                           RsvelteBuf *out)
        MethodHandle rsvelte_compile_into = linker.downcallHandle(
            lib.find("rsvelte_compile_into").orElseThrow(),
            FunctionDescriptor.ofVoid(
                ValueLayout.ADDRESS, ValueLayout.JAVA_LONG,
                ValueLayout.ADDRESS, ValueLayout.JAVA_LONG,
                ValueLayout.ADDRESS
            )
        );
        MethodHandle rsvelte_compile_module_into = linker.downcallHandle(
            lib.find("rsvelte_compile_module_into").orElseThrow(),
            FunctionDescriptor.ofVoid(
                ValueLayout.ADDRESS, ValueLayout.JAVA_LONG,
                ValueLayout.ADDRESS, ValueLayout.JAVA_LONG,
                ValueLayout.ADDRESS
            )
        );
        MethodHandle rsvelte_free_raw = linker.downcallHandle(
            lib.find("rsvelte_free_raw").orElseThrow(),
            FunctionDescriptor.ofVoid(
                ValueLayout.ADDRESS, ValueLayout.JAVA_LONG, ValueLayout.JAVA_LONG
            )
        );

        MemorySegment versionPtr = (MemorySegment) rsvelte_version.invoke();
        // The returned pointer has zero-length info; reinterpret with a
        // generous bound so we can read NUL-terminated bytes.
        String version = versionPtr.reinterpret(64)
            .getString(0, StandardCharsets.UTF_8);
        System.out.println("rsvelte version: " + version);

        int failures = 0;
        failures += run(
            rsvelte_compile_into, rsvelte_free_raw,
            "basic component",
            "<h1>Hello from Java, {name}!</h1>",
            null,
            true);
        failures += run(
            rsvelte_compile_into, rsvelte_free_raw,
            "runes + dev",
            "<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
            "{\"filename\":\"App.svelte\",\"dev\":true,\"runes\":true}",
            true);
        failures += run(
            rsvelte_compile_into, rsvelte_free_raw,
            "ssr generate",
            "<p>server-rendered from java</p>",
            "{\"generate\":\"server\",\"filename\":\"Ssr.svelte\"}",
            true);
        failures += run(
            rsvelte_compile_module_into, rsvelte_free_raw,
            "module: $state rune",
            "export const counter = $state(0);",
            "{\"filename\":\"counter.svelte.js\"}",
            true);
        failures += run(
            rsvelte_compile_into, rsvelte_free_raw,
            "malformed options",
            "<h1>x</h1>",
            "{not json",
            false);

        if (failures == 0) {
            System.out.println("\nPASS — 0 failure(s)");
        } else {
            System.out.println("\nFAIL — " + failures + " failure(s)");
            System.exit(1);
        }
    }

    private static int run(
        MethodHandle compileFn,
        MethodHandle freeFn,
        String label,
        String source,
        String options,
        boolean expectOk
    ) throws Throwable {
        System.out.println("\n=== " + label + " ===");
        try (Arena arena = Arena.ofConfined()) {
            byte[] srcBytes = source.getBytes(StandardCharsets.UTF_8);
            MemorySegment srcSeg = arena.allocate(Math.max(srcBytes.length, 1));
            MemorySegment.copy(srcBytes, 0, srcSeg, ValueLayout.JAVA_BYTE, 0, srcBytes.length);

            MemorySegment optSeg;
            long optLen;
            if (options == null) {
                optSeg = MemorySegment.NULL;
                optLen = 0;
            } else {
                byte[] optBytes = options.getBytes(StandardCharsets.UTF_8);
                optSeg = arena.allocate(Math.max(optBytes.length, 1));
                MemorySegment.copy(optBytes, 0, optSeg, ValueLayout.JAVA_BYTE, 0, optBytes.length);
                optLen = optBytes.length;
            }

            MemorySegment outBuf = arena.allocate(BUF_LAYOUT);
            compileFn.invoke(
                srcBytes.length == 0 ? MemorySegment.NULL : srcSeg,
                (long) srcBytes.length,
                optSeg,
                optLen,
                outBuf
            );

            MemorySegment dataPtr = outBuf.get(ValueLayout.ADDRESS, 0);
            long len = outBuf.get(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS.byteSize());
            long cap = outBuf.get(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS.byteSize() + 8);

            if (dataPtr.equals(MemorySegment.NULL) || len == 0) {
                System.err.println("FAIL: " + label + " returned empty buffer");
                return 1;
            }
            MemorySegment view = dataPtr.reinterpret(len);
            String body = new String(view.toArray(ValueLayout.JAVA_BYTE), StandardCharsets.UTF_8);
            String preview = body.length() > 300 ? body.substring(0, 300) + "..." : body;
            System.out.println(preview);

            freeFn.invoke(dataPtr, len, cap);

            boolean isOk = body.startsWith("{\"ok\":true");
            boolean isFail = body.startsWith("{\"ok\":false");
            if (expectOk && !isOk) {
                System.err.println("FAIL: " + label + " expected ok=true");
                return 1;
            }
            if (!expectOk && !isFail) {
                System.err.println("FAIL: " + label + " expected ok=false");
                return 1;
            }
            return 0;
        }
    }

    private static String dylibName() {
        String osName = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        if (osName.contains("mac") || osName.contains("darwin")) return "librsvelte_capi.dylib";
        if (osName.contains("win"))                                return "rsvelte_capi.dll";
        return "librsvelte_capi.so";
    }
}
