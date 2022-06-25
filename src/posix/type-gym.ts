/**
 * Template meta programming version of path.posix.join().
 *
 * See https://github.com/nodejs/node/blob/84db3e7b06979a388a65d8ebce2571554c2dadd6/lib/path.js#L1166
 */
export type Join<Paths extends string[]> =
    Joined<'', Paths> extends ''
        ? '.'
        : Normalize<Joined<'', Paths>>
    ;

type Joined<Curr extends string, Paths extends string[]> =
    Paths extends []
        ? Curr
        : Paths extends [infer P]
            ? P extends string
                ? Joined_1<Curr, P>
                : never
            : Paths extends [infer P1, ...infer PRest]
                ? P1 extends string ? PRest extends string[]
                    ? Joined<
                          Joined_1<Curr, P1>,
                          PRest
                      >
                    : never : never : never
    ;

type Joined_1<Curr extends string, P extends string> =
    P extends ''
        ? Curr
        : Curr extends ''
            ? P
            : `${Curr}/${P}`
    ;

export type Normalize<P extends string> =
    NormalizeString<P> extends ''
        ? IsAbs<P> extends true
            ? '/'
            : (TrailingSep<P> extends true ? './' : '.')
        : IsAbs<P> extends true
            ? TrailingSep<P> extends true ? `/${NormalizeString<P>}/` : `/${NormalizeString<P>}`
            : TrailingSep<P> extends true ? `${NormalizeString<P>}/` : `${NormalizeString<P>}`
        ;

type IsAbs<P extends string> = P extends `/${infer A}` ? true : false;
type TrailingSep<P extends string> = P extends `${infer A}/` ? true : false;

type NormalizeString<P extends string> =
    Stack2String<
        NS_N<[], String2Stack<P>, IsAbs<P>>
    >;

type NS_1<Stack extends string[], T extends string, Abs extends boolean> =
    T extends '.'
        ? Stack
        : T extends '..'
            ? (
                Stack extends []
                    ? Abs extends true ? [] : ['..']
                    : StackTop<Stack> extends '..'
                        ? PushStack<Stack, '..'>
                        : PopStack<Stack>
            )
            : PushStack<Stack, T>
    ;

type NS_N<Stack extends string[], T extends string[], Abs extends boolean> =
    T extends []
        ? Stack
        : T extends [infer A]
            ? A extends string ? NS_1<Stack, A, Abs> : never
            : T extends [infer B, ...infer Rest]
                ? B extends string ? Rest extends string[]
                    ? NS_N<
                        NS_1<Stack, B, Abs>, Rest, Abs
                      >
                    : never : never : never
    ;

/**
 * @example
 * Stack         <-         String
 * []                       ''
 * ['abc']                  'abc'
 * ['abc', 'efg']           'abc/efg'
 * ['a', 'b', 'c']          'a/b/c'
 * ['a', '..', 'b', 'c']    '///a/../b//c/'
 */
type String2Stack<S extends string> =
    S extends ''
        ? []
        : S extends `${infer A}/${infer B}`
            ? Concat<String2Stack<A>, String2Stack<B>>
            : [S]
    ;

/**
 * @example
 * Stack        ->          String
 * []                       ''
 * ['abc']                  'abc'
 * ['abc', 'efg']           'abc/efg'
 * ['a', 'b', 'c']          'a/b/c'
 * ['a', '..', 'b', 'c']    'a/../b/c'
 */
type Stack2String<S extends string[]> =
    S extends []
        ? ''
        : S extends [...infer A, infer B]
            ? A extends string[]
                ? B extends string
                    ? StringConcat<Stack2String<A>, B>
                    : never
                : never
            : ''
    ;

type Concat<A extends unknown[], B extends unknown[]> = [...A, ...B];
type StringConcat<A extends string, B extends string> =
    A extends ''
        ? B
        : B extends ''
            ? A
            : `${A}/${B}`
    ;

type PushStack<Stack extends unknown[], T extends unknown> =
    [...Stack, T];

/** Stack must be non empty. */
type PopStack<Stack extends unknown[]> =
    Stack extends [...infer Rest, infer Top]
        ? [...Rest]
        : never;

/** Stack must be non empty. */
type StackTop<Stack extends unknown[]> =
    Stack extends [...infer Rest, infer Top]
        ? Top
        : never;
