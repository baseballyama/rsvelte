# P1 — C API silently coerces invalid enum options to defaults

Category: API correctness / compatibility

Evidence: unknown `generate` values become client mode and unknown namespaces become HTML (`crates/rsvelte_capi/src/lib.rs:509-553`); the same catch-all pattern is used for other enum-shaped options later in `parse_compile_options`. JSON syntax errors are returned, but valid JSON with invalid option values is accepted.

Impact: typos compile for the wrong target or namespace instead of failing, making the C API behavior diverge from the compiler's validated option contract and producing difficult-to-diagnose output.

Remediation: deserialize into strict enums with aliases only for documented values and return a field-specific error for every unknown variant.

Acceptance: table-driven C API tests reject every invalid enum string and accept exactly the public aliases, matching the N-API/compiler option behavior.
