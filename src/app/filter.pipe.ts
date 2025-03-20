import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: string[], searchText: string): string[] {
    if (!items || !searchText) {
      return items;
    }
    return items.filter((item) =>
      item.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}