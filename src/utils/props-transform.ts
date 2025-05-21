function getKey(key: string) {
  return key.replace(/([A-Z])/g, (_, letter) => `-${letter.toLowerCase()}`);
}

type TransFlag = string | { key: string; type?: string; transform?: (value: any) => any };

function parseFlag(flag: TransFlag) {
  if (typeof flag === 'string') {
    const [key, type] = flag.split('|');
    return { key, type };
  }
  return flag;
}

function getParseHandler(type?: string): ((v: any) => any) {
  switch (type) {
    case 'number':
      return v => Number(v);
    case 'boolean':
      return v => v === 'true' || typeof v !== 'undefined';
    case 'json':
      return v => JSON.parse(v);
    default:
      return v => v;
  }
}

export function propsTransform(props: Record<string, any>, transFlag: TransFlag[]) {
  const result: Record<string, any> = {};
  transFlag.forEach((flag) => {
    const { key, type, transform = getParseHandler(type) } = parseFlag(flag);
    result[key] = transform(props[key] || props[getKey(key)]);
  });
  return result;
}

export const pt = propsTransform;
