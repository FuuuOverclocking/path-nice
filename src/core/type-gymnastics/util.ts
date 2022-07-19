import type { PathNice } from '../types.js';

export type Extract<P extends string | PathNice> =
    P extends string
        ? P
        : P extends PathNice<infer A extends string>
            ? A
            : unknown
        ;

export type ExtractArr<P extends Array<string | PathNice>> =
    P extends []
        ? []
        : P extends [infer A extends string | PathNice]
            ? [Extract<A>]
            : P extends [infer B extends string | PathNice,
                         ...infer Rest extends Array<string | PathNice>]
                ? [Extract<B>, ...ExtractArr<Rest>]
                : never
    ;
