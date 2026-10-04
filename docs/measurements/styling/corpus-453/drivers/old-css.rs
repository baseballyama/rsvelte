use std::io::{Read,Write};
use std::hint::black_box;
fn gate() { println!("RSVELTE_CYCLE_GATE");std::io::stdout().flush().unwrap();std::io::stdin().read_exact(&mut [0]).unwrap(); }
fn main() -> Result<(),Box<dyn std::error::Error>> {
 let args:Vec<_>=std::env::args().skip(1).collect();assert_eq!(args.len(),3);assert_eq!(args[1],"total");let rounds:usize=args[2].parse()?;
 let inputs:Vec<_>=std::fs::read_to_string(&args[0])?.lines().map(|line| { let fields:Vec<_>=line.split('\t').collect();assert_eq!(fields.len(),3);(fields[0].to_owned(),std::fs::read_to_string(fields[1]).unwrap(),std::fs::read_to_string(fields[2]).unwrap()) }).collect();assert!(!inputs.is_empty());
 let run=|check:bool| -> Result<usize,Box<dyn std::error::Error>> {
   let mut sum=0;for (filename,source,expected) in &inputs {
     let options=rsvelte_core::CompileOptions {filename:Some(filename.clone()),runes:Some(true),..Default::default()};
     let css=rsvelte_core::compiler::measure_css_only(source,options)?;
     if check && css!=*expected {return Err(format!("{filename}: CSS differs").into());}
     sum+=css.len();black_box(css);
   } Ok(sum)
 };
 run(true)?;for _ in 0..20 {run(false)?;}
 gate();let start=std::time::Instant::now();let mut checksum=0;for _ in 0..rounds{checksum+=run(false)?;}let elapsed=start.elapsed();gate();
 println!("{{\"documents\":{},\"phase\":\"total\",\"rounds\":{},\"elapsed_ns\":{},\"checksum\":{}}}",inputs.len(),rounds,elapsed.as_nanos(),checksum);Ok(())
}
