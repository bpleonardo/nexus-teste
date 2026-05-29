export function zodCpfValidator(cpf: string): boolean {
  // https://www.geradorcpf.com/algoritmo_do_cpf.htm
  cpf = cpf.replace(/[^\d]+/g, '');

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let mod = sum % 11;

  const digit1 = mod < 2 ? 0 : 11 - mod;

  if (digit1 !== parseInt(cpf.charAt(9))) {
    return false;
  }

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  mod = sum % 11;

  const digit2 = mod < 2 ? 0 : 11 - mod;

  return digit2 === parseInt(cpf.charAt(10));
}

export function flattenZodErrors(obj: any, prefix = ''): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  if (obj.errors.length) {
    const key = prefix || '@';
    result[key] = obj.errors.map((err: any) => err.toLowerCase());
  }

  if (obj.properties) {
    for (const [prop, value] of Object.entries(obj.properties)) {
      const newPrefix = prefix ? `${prefix}.${prop}` : prop;
      Object.assign(result, flattenZodErrors(value, newPrefix));
    }
  }

  return result;
}
