import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: string[], searchText: string): string[] {
    if (!items || !searchText) {
      return items;
    }
    // Filtra los elementos que coincidan con el texto de búsqueda
    return items.filter((item) =>
      item.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}