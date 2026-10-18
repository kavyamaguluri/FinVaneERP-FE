import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '₹0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0.00';

    const isNegative = num < 0;
    const absVal = Math.abs(num).toFixed(2);
    const [intPart, decPart] = absVal.split('.');

    let formattedInt = '';
    if (intPart.length <= 3) {
      formattedInt = intPart;
    } else {
      const lastThree = intPart.substring(intPart.length - 3);
      const rest = intPart.substring(0, intPart.length - 3);

      let restFormatted = '';
      let count = 0;
      for (let i = rest.length - 1; i >= 0; i--) {
        restFormatted = rest.charAt(i) + restFormatted;
        count++;
        if (count % 2 === 0 && i > 0) {
          restFormatted = ',' + restFormatted;
        }
      }
      formattedInt = restFormatted + ',' + lastThree;
    }

    return (isNegative ? '-₹' : '₹') + formattedInt + '.' + decPart;
  }
}
