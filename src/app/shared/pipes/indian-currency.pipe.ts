import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: number | string | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || value === '') return decimals === 0 ? '₹0' : '₹0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return decimals === 0 ? '₹0' : '₹0.00';

    const isNegative = num < 0;
    const absVal = Math.abs(num).toFixed(decimals);
    const dotIdx = absVal.indexOf('.');
    const intPart = dotIdx === -1 ? absVal : absVal.substring(0, dotIdx);
    const decPart = dotIdx === -1 ? '' : absVal.substring(dotIdx + 1);

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

    const prefix = isNegative ? '-₹' : '₹';
    return decPart ? `${prefix}${formattedInt}.${decPart}` : `${prefix}${formattedInt}`;
  }
}