<?php
/**
 * rsvelte PHP FFI smoke test.
 *
 * Requires PHP 7.4+ with the built-in `ffi` extension (loaded by
 * default in most distributions; check via `php -m | grep -i ffi`).
 *
 * Run from the repository root:
 *   cargo build -p rsvelte_capi --release
 *   php crates/rsvelte_capi/examples/php/smoke.php
 *
 * NOTE: ext-ffi only loads dynamic libraries from a CLI script by
 * default, or when `ffi.enable=preload` plus a preload script in
 * php.ini for FPM/web SAPIs.
 */

declare(strict_types=1);

if (!extension_loaded('ffi')) {
    fwrite(STDERR, "FAIL: ext-ffi is not loaded — recompile PHP with --with-ffi or `pecl install ffi`\n");
    exit(2);
}

$root  = realpath(__DIR__ . '/../../../..');
$os    = strtolower(PHP_OS_FAMILY);
$names = [
    'darwin'  => 'librsvelte_capi.dylib',
    'linux'   => 'librsvelte_capi.so',
    'windows' => 'rsvelte_capi.dll',
];
$dyName = $names[$os] ?? 'librsvelte_capi.so';
$dyPath = $root . DIRECTORY_SEPARATOR . 'target' . DIRECTORY_SEPARATOR . 'release' . DIRECTORY_SEPARATOR . $dyName;

if (!file_exists($dyPath)) {
    fwrite(STDERR, "FAIL: dylib not found at {$dyPath} — run `cargo build -p rsvelte_capi --release` first\n");
    exit(2);
}

/* The struct + signatures must mirror rsvelte.h exactly. */
$cdef = <<<CDEF
typedef struct {
    uint8_t *data;
    size_t   len;
    size_t   cap;
} RsvelteBuf;

const char *rsvelte_version(void);
void        rsvelte_free(RsvelteBuf buf);
RsvelteBuf  rsvelte_compile(const uint8_t *source, size_t source_len,
                            const uint8_t *options_json, size_t options_len);
RsvelteBuf  rsvelte_compile_module(const uint8_t *source, size_t source_len,
                                   const uint8_t *options_json, size_t options_len);
CDEF;

$ffi = FFI::cdef($cdef, $dyPath);

// PHP-FFI auto-decodes `const char *` returns into a PHP string, so we
// must not double-wrap with FFI::string() here (it expects FFI\CData).
$version = $ffi->rsvelte_version();
if ($version instanceof FFI\CData) {
    $version = FFI::string($version);
}
printf("rsvelte version: %s\n", $version);

/**
 * Copy a PHP string into an FFI-owned uint8_t buffer; returns the
 * buffer (must be kept alive for the duration of the C call) and a
 * pointer to its first byte.
 */
function toBuf(\FFI $ffi, string $s): array {
    $len = strlen($s);
    if ($len === 0) {
        return [null, null, 0];
    }
    $buf = $ffi->new("uint8_t[$len]", false);
    FFI::memcpy($buf, $s, $len);
    return [$buf, FFI::addr($buf[0]), $len];
}

/**
 * Drive an rsvelte_* function and return the decoded JSON envelope.
 */
function call(\FFI $ffi, string $fn, string $source, ?string $optionsJson): array {
    $optsJson = $optionsJson ?? '';
    [$srcBuf, $srcPtr, $srcLen] = toBuf($ffi, $source);
    [$optBuf, $optPtr, $optLen] = toBuf($ffi, $optsJson);

    /** @var object $out */
    $out = $ffi->{$fn}($srcPtr, $srcLen, $optPtr, $optLen);
    try {
        if ($out->len === 0 || FFI::isNull($out->data)) {
            throw new RuntimeException("$fn returned empty buffer");
        }
        $json = FFI::string($out->data, $out->len);
        return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    } finally {
        $ffi->rsvelte_free($out);
    }
}

$failures = 0;
$cases = [
    ['rsvelte_compile',        'basic component',
        '<h1>Hello from PHP, {name}!</h1>', null, true],
    ['rsvelte_compile',        'runes + dev',
        "<script>let { count = 0 } = \$props();</script>\n<button onclick={() => count++}>{count}</button>",
        '{"filename":"App.svelte","dev":true,"runes":true}', true],
    ['rsvelte_compile',        'ssr generate',
        '<p>server-rendered from php</p>',
        '{"generate":"server","filename":"Ssr.svelte"}', true],
    ['rsvelte_compile_module', 'module: $state rune',
        'export const counter = $state(0);',
        '{"filename":"counter.svelte.js"}', true],
    ['rsvelte_compile',        'malformed options',
        '<h1>x</h1>', '{not json', false],
];

foreach ($cases as [$fn, $label, $src, $opts, $expectOk]) {
    echo "\n=== {$label} ===\n";
    try {
        $env = call($ffi, $fn, $src, $opts);
    } catch (Throwable $e) {
        fwrite(STDERR, "FAIL: {$label} — {$e->getMessage()}\n");
        $failures++;
        continue;
    }
    $repr = json_encode($env);
    echo (strlen($repr) > 300 ? substr($repr, 0, 300) . "..." : $repr) . "\n";
    $ok = $env['ok'] ?? null;
    if ($ok !== $expectOk) {
        fwrite(STDERR, "FAIL: {$label} — expected ok={$expectOk}, got " . var_export($ok, true) . "\n");
        $failures++;
    }
}

echo "\n" . ($failures === 0 ? "PASS — 0 failure(s)" : "FAIL — {$failures} failure(s)") . "\n";
exit($failures === 0 ? 0 : 1);
