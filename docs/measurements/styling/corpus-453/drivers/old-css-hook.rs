pub fn measure_css_only(source: &str, options: CompileOptions) -> Result<String, CompileError> {
    let mut ast = parse_component(source, false)?;
    let _guard = unsafe { SerializeArenaGuard::new(&ast.arena as *const _) };
    let (options, analysis, _, _retained) = prepare_and_analyze(&mut ast, source, options)?;
    Ok(phases::phase3_transform::css::render_stylesheet(
        &analysis, ast.css.as_deref(), source, &options
    )?.code)
}
