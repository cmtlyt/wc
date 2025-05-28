type CE<E> = E extends CustomEvent<any> ? E : CustomEvent<E>;

export function createEvent<T>(event: string, detail: T): CE<T> {
  if (detail instanceof CustomEvent) {
    detail = detail.detail;
  }
  return new CustomEvent(event, { detail }) as any;
}
