import type { TExclude } from '@cmtlyt/base';

type Printify<T extends Record<string, any>> = {
  [K in keyof T]: T[K]
};

interface TypeMap {
  function: (...args: any[]) => any;
  number: number;
  boolean: boolean;
  string: string;
}

type AllType = keyof TypeMap | 'json';

type GetType<
  T extends (keyof TypeMap) | (string & {}) | undefined,
  K = T extends string ? Lowercase<T> : undefined,
> = K extends keyof TypeMap ? TypeMap[K] : any;

export type TransFlag = string | { key: string; type?: AllType; transform?: (value: any) => any };

function parseFlag(flag: TransFlag): TransFlag & object {
  if (typeof flag === 'string') {
    const [key, type]: any[] = flag.split('|');
    return { key, type };
  }
  return flag;
}

function getParseHandler(key: string, _type: AllType | undefined): ((v: any) => any) {
  switch (_type) {
    case 'number':
      return v => v == null ? v : Number(v);
    case 'string':
      return v => v == null ? v : String(v);
    case 'boolean':
      return v => v === 'true' || typeof v !== 'undefined';
    case 'json':
      return v => JSON.parse(v);
    case 'function':
      return (v) => {
        if (v && typeof v !== 'function') {
          console.warn(`为保证系统安全, 原则上不允许传递函数, 如果 ${key} 是一个事件的话, 推荐使用 target.addEventListener 绑定事件, 而不是直接传递该属性`);
          // eslint-disable-next-line no-new-func
          return new Function('...args', `(${v}).apply(this, args)`);
        }
        return v;
      };
    default:
      _type satisfies undefined;
      return v => v;
  }
}

type GetPropInfo<F extends TransFlag, O extends Record<string, any>, OK = keyof O> =
  F extends string
    ? F extends `${infer K}|${infer T}`
      ? { key: K; type: K extends OK ? O[K] : GetType<T> }
      : { key: F; type: F extends OK ? O[F] : any }
    : F extends object
      ? { key: F['key']; type: F['transform'] extends
        (value: (F['key'] extends OK ? O[F['key']] : any)) => infer T
          ? T
          : F['key']extends OK
            ? O[F['key']]
            : F['type'] extends undefined
              ? any
              : GetType<F['type']>; }
      : never;

type TransRecord<F extends TransFlag[], O extends Record<string, any>, R = Record<string, any>> =
  F extends []
    ? R
    : F extends [infer I extends TransFlag, ...infer L extends TransFlag[]]
      ? GetPropInfo<I, O> extends { key: infer K extends string; type: infer T }
        ? TransRecord<L, O, R & Record<K, () => T>>
        : TransRecord<L, O, R>
      : R;

type GetTransKeys<F extends TransFlag[]> = F extends [infer I extends TransFlag, ...infer L extends TransFlag[]]
  ? GetPropInfo<I, Record<string, any>> extends { key: infer K extends string }
    ? K | GetTransKeys<L>
    : GetTransKeys<L>
  : never;

interface RestRecord<T extends Record<string, any>, F extends TransFlag[], I extends (keyof T)[]> {
  rest: () => Printify<
    I extends []
      ? TExclude<T, GetTransKeys<F>>
      : TExclude<T, GetTransKeys<F> | I[number]>
  >
  & Record<string, any>;
}

function getKey(key: string) {
  return key.replace(/([A-Z])/g, (_, letter) => `-${letter.toLowerCase()}`);
}

export function propsTransform<
  T extends Record<string, any>,
  F extends TransFlag[],
  I extends (keyof T)[] = [],
>(props: T, transFlag: F, restIgnore?: I): Printify<TransRecord<F, T> & RestRecord<T, F, I>> {
  const result: Record<string, any> = {};
  transFlag.forEach((flag) => {
    const { key, type, transform = getParseHandler(key, type?.toLowerCase() as any) } = parseFlag(flag);
    /**
     * 优先级:
     * 1. 驼峰
     * 2. 小写
     * 3. 横线
     *
     * example:
     *   key: 'onAppear'
     *   key: 'onappear'
     *   key: 'on-appear'
     */
    result[key] = () => transform(props[key] || props[key.toLowerCase()] || props[getKey(key)]);
  });

  const keys = new Set(Object.keys(props));

  (restIgnore || []).forEach(rik => keys.delete(rik as any));

  result.rest = () => Object.fromEntries(keys.entries().map(([key]) => [key, props[key]]));

  return result as any;
}

export const pt = propsTransform;
