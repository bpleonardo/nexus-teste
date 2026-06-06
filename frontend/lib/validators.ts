export function validateCPF(cpf: string): boolean {
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
    console.debug('First digit does not match:', digit1, cpf.charAt(9));
    return false;
  }

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  mod = sum % 11;

  const digit2 = mod < 2 ? 0 : 11 - mod;

  console.debug('Second digit:', digit2, cpf.charAt(10));
  return digit2 === parseInt(cpf.charAt(10));
}
