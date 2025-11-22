// Temporary shim: only `tree-kill` lacks @types on DefinitelyTyped
declare module 'tree-kill' {
  const kill: (pid: number, cb?: (err?: any) => void) => void;
  export default kill;
}
