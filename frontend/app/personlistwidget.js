import { ListItemWidget, ListWidget } from '../lib/base/listwidget.js'

class PersonListItemWidget extends ListItemWidget {
    getItemHTML() {
        return `
        <th scope="row">${this.index}</th>
        <td>${this.datum.name}</td>
        <td>${this.datum.surname}</td>
        `
    }
}

class PersonListWidget extends ListWidget {
    listItemClass = PersonListItemWidget;

    getHeaderHTML() {
        return `
        <tr>
        <th scope="col">#</th>
        <th scope="col">Name</th>
        <th scope="col">Surname</th>
        </tr>
        `
    }

}

export { PersonListWidget }
