#!/usr/bin/env ruby
# frozen_string_literal: true
#
# rsvelte Ruby smoke test via stdlib Fiddle (no gems).
#
# Run from the repository root:
#   cargo build -p rsvelte_capi --release
#   ruby crates/rsvelte_capi/examples/ruby/smoke.rb
#
# Fiddle's C parser doesn't understand returning struct-by-value, so
# we use the rsvelte_compile_into / rsvelte_compile_module_into
# out-parameter variants instead.

require "fiddle"
require "fiddle/import"
require "fiddle/struct"
require "json"
require "rbconfig"

ROOT       = File.expand_path("../../../..", __dir__)
TARGET_DIR = File.join(ROOT, "target", "release")
DYLIB_NAME = case RbConfig::CONFIG["host_os"]
             when /darwin/ then "librsvelte_capi.dylib"
             when /mswin|mingw|cygwin/ then "rsvelte_capi.dll"
             else "librsvelte_capi.so"
             end
DYLIB_PATH = File.join(TARGET_DIR, DYLIB_NAME)

unless File.exist?(DYLIB_PATH)
  warn "FAIL: dylib not found at #{DYLIB_PATH} — run `cargo build -p rsvelte_capi --release` first"
  exit 2
end

module Rsvelte
  extend Fiddle::Importer
  dlload DYLIB_PATH

  RsvelteBuf = struct ["void* data", "size_t len", "size_t cap"]

  extern "const char *rsvelte_version()"
  extern "void rsvelte_compile_into(const void *, size_t, const void *, size_t, void *)"
  extern "void rsvelte_compile_module_into(const void *, size_t, const void *, size_t, void *)"
  # Decomposed-args variant of rsvelte_free — the struct-by-value
  # variant uses a calling convention that Fiddle (Ruby 2.6) can't
  # construct correctly on AArch64.
  extern "void rsvelte_free_raw(void *, size_t, size_t)"
end

def call_into(fn, source, options_json)
  src = (source || "").b
  opt = (options_json || "").b

  src_ptr = src.empty? ? Fiddle::NULL : Fiddle::Pointer[src]
  opt_ptr = opt.empty? ? Fiddle::NULL : Fiddle::Pointer[opt]
  src_len = src.bytesize
  opt_len = opt.bytesize

  out = Rsvelte::RsvelteBuf.malloc
  begin
    fn.call(src_ptr, src_len, opt_ptr, opt_len, out)
    raise "rsvelte returned empty buffer" if out.len.zero? || out.data.to_i.zero?
    Fiddle::Pointer.new(out.data.to_i)[0, out.len]
  ensure
    Rsvelte.rsvelte_free_raw(out.data, out.len, out.cap) unless out.data.to_i.zero?
  end
end

def run_case(label:, source:, options:, expect_ok:, fn:)
  puts "\n=== #{label} ==="
  options_json = options.nil? ? "" : JSON.generate(options)
  body = call_into(fn, source, options_json)
  env  = JSON.parse(body)
  short = body.length > 300 ? body[0, 300] + "..." : body
  puts short
  if env["ok"] != expect_ok
    warn "FAIL: #{label} — expected ok=#{expect_ok}, got #{env['ok'].inspect}"
    return false
  end
  true
end

COMPILE        = Rsvelte.method(:rsvelte_compile_into)
COMPILE_MODULE = Rsvelte.method(:rsvelte_compile_module_into)

puts "rsvelte version: #{Rsvelte.rsvelte_version.to_s}"

failures = 0
failures += 1 unless run_case(
  label: "basic component",
  source: "<h1>Hello from Ruby, {name}!</h1>",
  options: nil,
  expect_ok: true,
  fn: COMPILE,
)
failures += 1 unless run_case(
  label: "runes + dev",
  source: "<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
  options: { "filename" => "App.svelte", "dev" => true, "runes" => true },
  expect_ok: true,
  fn: COMPILE,
)
failures += 1 unless run_case(
  label: "ssr generate",
  source: "<p>server-rendered from ruby</p>",
  options: { "generate" => "server", "filename" => "Ssr.svelte" },
  expect_ok: true,
  fn: COMPILE,
)
failures += 1 unless run_case(
  label: "module: $state rune",
  source: "export const counter = $state(0);",
  options: { "filename" => "counter.svelte.js" },
  expect_ok: true,
  fn: COMPILE_MODULE,
)
# Error path — pass raw malformed JSON, bypassing the JSON.generate helper.
puts "\n=== malformed options ==="
body = call_into(COMPILE, "<h1>x</h1>", "{not json")
env  = JSON.parse(body)
puts body
unless env["ok"] == false
  warn "FAIL: malformed options — expected ok=false"
  failures += 1
end

if failures.zero?
  puts "\nPASS — 0 failure(s)"
  exit 0
end
puts "\nFAIL — #{failures} failure(s)"
exit 1
