import type { PathNicePosix } from "./path-nice-posix";
export declare type PathToString<P extends string | PathNicePosix<string>> = P extends string ? P : P extends PathNicePosix<infer A extends string> ? A : never;
declare type ArrayPathToArrayString<P extends Array<string | PathNicePosix<string>>> = P extends [] ? [] : P extends [infer A extends string | PathNicePosix<string>] ? [PathToString<A>] : P extends [
    infer B extends string | PathNicePosix<string>,
    ...infer Rest extends Array<string | PathNicePosix<string>>
] ? [PathToString<B>, ...ArrayPathToArrayString<Rest>] : never;
/**
 * Template meta programming version of path.posix.join().
 *
 * See https://github.com/nodejs/node/blob/84db3e7b06979a388a65d8ebce2571554c2dadd6/lib/path.js#L1166
 */
export declare type Join<Paths extends Array<string | PathNicePosix<string>>> = HasString<ArrayPathToArrayString<Paths>> extends true ? string : Joined<'', ArrayPathToArrayString<Paths>> extends '' ? '.' : Normalize<Joined<'', ArrayPathToArrayString<Paths>>>;
declare type HasString<Paths extends string[]> = Paths extends [] ? false : Paths extends [infer A] ? string extends A ? true : false : Paths extends [infer B, ...infer Rest] ? string extends B ? true : Rest extends string[] ? HasString<Rest> : never : never;
declare type Joined<Curr extends string, Paths extends string[]> = Paths extends [] ? Curr : Paths extends [infer P] ? P extends string ? Joined_1<Curr, P> : never : Paths extends [infer P1, ...infer PRest] ? P1 extends string ? PRest extends string[] ? Joined<Joined_1<Curr, P1>, PRest> : never : never : never;
declare type Joined_1<Curr extends string, P extends string> = P extends '' ? Curr : Curr extends '' ? P : `${Curr}/${P}`;
/**
 * Template meta programming version of path.posix.normalize().
 *
 * See https://github.com/nodejs/node/blob/84db3e7b06979a388a65d8ebce2571554c2dadd6/lib/path.js#L1127
 */
export declare type Normalize<P extends string> = string extends P ? string : NormalizeString<P> extends '' ? IsAbs<P> extends true ? '/' : (TrailingSep<P> extends true ? './' : '.') : IsAbs<P> extends true ? TrailingSep<P> extends true ? `/${NormalizeString<P>}/` : `/${NormalizeString<P>}` : TrailingSep<P> extends true ? `${NormalizeString<P>}/` : `${NormalizeString<P>}`;
export declare type IsAbs<P extends string> = string extends P ? boolean : P extends `/${infer A}` ? true : false;
declare type TrailingSep<P extends string> = string extends P ? boolean : P extends `${infer A}/` ? true : false;
declare type NormalizeString<P extends string> = Stack2String<NS_N<[], String2Stack<P>, IsAbs<P>>>;
declare type NS_1<Stack extends string[], T extends string, Abs extends boolean> = T extends '.' ? Stack : T extends '..' ? (Stack extends [] ? Abs extends true ? [] : ['..'] : StackTop<Stack> extends '..' ? PushStack<Stack, '..'> : PopStack<Stack>) : PushStack<Stack, T>;
declare type NS_N<Stack extends string[], T extends string[], Abs extends boolean> = T extends [] ? Stack : T extends [infer A] ? A extends string ? NS_1<Stack, A, Abs> : never : T extends [infer B, ...infer Rest] ? B extends string ? Rest extends string[] ? NS_N<NS_1<Stack, B, Abs>, Rest, Abs> : never : never : never;
/**
 * @example
 * Stack         <-         String
 * []                       ''
 * ['abc']                  'abc'
 * ['abc', 'efg']           'abc/efg'
 * ['a', 'b', 'c']          'a/b/c'
 * ['a', '..', 'b', 'c']    '///a/../b//c/'
 */
declare type String2Stack<S extends string> = S extends '' ? [] : S extends `${infer A}/${infer B}` ? Concat<String2Stack<A>, String2Stack<B>> : [S];
/**
 * @example
 * Stack        ->          String
 * []                       ''
 * ['abc']                  'abc'
 * ['abc', 'efg']           'abc/efg'
 * ['a', 'b', 'c']          'a/b/c'
 * ['a', '..', 'b', 'c']    'a/../b/c'
 */
declare type Stack2String<S extends string[]> = S extends [] ? '' : S extends [...infer A, infer B] ? A extends string[] ? B extends string ? StringConcat<Stack2String<A>, B> : never : never : '';
declare type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
declare type StringConcat<A extends string, B extends string> = A extends '' ? B : B extends '' ? A : `${A}/${B}`;
declare type PushStack<Stack extends unknown[], T extends unknown> = [
    ...Stack,
    T
];
/** Stack must be non empty. */
declare type PopStack<Stack extends unknown[]> = Stack extends [...infer Rest, infer Top] ? [...Rest] : never;
/** Stack must be non empty. */
declare type StackTop<Stack extends unknown[]> = Stack extends [...infer Rest, infer Top] ? Top : never;
export declare type ForceSep<P extends string, T extends '/' | '\\'> = ReplaceAll<ReplaceAll<P, '\\', T>, '/', T>;
declare type ReplaceAll<S extends string, Search extends string, To extends string> = Search extends '' ? S : S extends `${infer L}${Search}${infer R}` ? `${ReplaceAll<L, Search, To>}${To}${ReplaceAll<R, Search, To>}` : S;
export {};
