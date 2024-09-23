export type NASAJWTPayload = {
  id: string;
  name: string;
  surname: string;
  role: string;
  teamId?: string;
};

export type Awaited<T> = T extends null | undefined
  ? T // special case for `null | undefined`
  : // when not in `--strictNullChecks` mode
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
  ? // `await` only unwraps object types with a callable `then`.
    // Non-object types are not unwrapped
    F extends (value: infer V, ...args: infer _) => any
    ? // if the argument to `then` is callable, extracts the first argument
      Awaited<V> // recursively unwrap the value
    : never // the argument to `then` was not callable
  : T; // non-object or non-thenable

export type AwaitedReturnType<T> = Awaited<ReturnType<T>>;
